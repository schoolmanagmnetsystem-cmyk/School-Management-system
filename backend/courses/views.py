from rest_framework import viewsets
from .models import Course, CourseEnrollment
from .serializers import CourseEnrollmentSerializer, CourseSerializer
from core.permissions import IsCourseAccess
from rest_framework.permissions import BasePermission, SAFE_METHODS
from accounts.audit import record_audit
from rest_framework.exceptions import ValidationError

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.select_related('teacher__user', 'school').all()
    serializer_class = CourseSerializer
    permission_classes = [IsCourseAccess]
    http_method_names = ['get', 'post', 'put', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if user.role in {'admin', 'school_admin', 'principal', 'receptionist'}:
            return self.queryset.filter(school=user.school)
        if user.role == 'parent':
            queryset = self.queryset.filter(enrollments__student__guardians__user=user, enrollments__is_active=True)
            selected_student = self.request.query_params.get('student')
            if selected_student:
                queryset = queryset.filter(enrollments__student_id=selected_student)
            return queryset.distinct()
        if user.role == 'teacher':
            return self.queryset.filter(teacher__user=user)
        if user.role == 'student':
            return self.queryset.filter(enrollments__student__user=user, enrollments__is_active=True).distinct()
        return self.queryset.none()

    def perform_create(self, serializer):
        from accounts.periods import resolve_school_period
        year, _ = resolve_school_period(self.request.user.school)
        course = serializer.save(school=self.request.user.school, academic_year=year)
        record_audit(self.request.user, 'course.created', course)

    def perform_update(self, serializer):
        course = serializer.save()
        record_audit(self.request.user, 'course.updated', course)

    def perform_destroy(self, instance):
        if instance.enrollments.exists() or instance.attendance.exists() or instance.results.exists():
            raise ValidationError('Courses with enrollments, attendance, or results cannot be deleted.')
        record_audit(self.request.user, 'course.deleted', instance)
        instance.delete()


class CourseEnrollmentPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in {'admin', 'school_admin'}:
            return True
        return request.user.role in {'principal', 'receptionist', 'teacher', 'student', 'parent'} and request.method in SAFE_METHODS


class CourseEnrollmentViewSet(viewsets.ModelViewSet):
    queryset = CourseEnrollment.objects.select_related('course', 'student', 'school')
    serializer_class = CourseEnrollmentSerializer
    permission_classes = [CourseEnrollmentPermission]
    http_method_names = ['get', 'post', 'patch', 'delete', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if user.role in {'admin', 'school_admin', 'principal', 'receptionist'}:
            return self.queryset.filter(school_id=user.school_id)
        if user.role == 'teacher':
            return self.queryset.filter(course__teacher__user=user)
        if user.role == 'student':
            return self.queryset.filter(student__user=user)
        if user.role == 'parent':
            queryset = self.queryset.filter(student__guardians__user=user)
            selected_student = self.request.query_params.get('student')
            if selected_student:
                queryset = queryset.filter(student_id=selected_student)
            return queryset.distinct()
        return self.queryset.none()

    def perform_create(self, serializer):
        enrollment = serializer.save()
        record_audit(self.request.user, 'student.enrolled', enrollment, {
            'student_id': enrollment.student_id,
            'course_id': enrollment.course_id,
        })

    def perform_update(self, serializer):
        enrollment = serializer.save()
        record_audit(self.request.user, 'enrollment.updated', enrollment, {'is_active': enrollment.is_active})

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save(update_fields=['is_active'])
        record_audit(self.request.user, 'enrollment.deactivated', instance, {'is_active': False})