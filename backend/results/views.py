from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied
from rest_framework.response import Response
from rest_framework.permissions import BasePermission
from django.utils import timezone
from .models import Result
from .serializers import ResultSerializer
from core.permissions import IsAdminOrTeacherResultPermission, assert_student_owns_record, school_admin_owns_record
from accounts.periods import resolve_school_period
from accounts.audit import record_audit


class CanPublishResults(BasePermission):
    """Only a principal or school administrator may publish results."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in {'principal', 'admin', 'school_admin'}
        )


class CanUnpublishResults(BasePermission):
    """Only a school administrator may unpublish results."""

    def has_permission(self, request, view):
        return bool(
            request.user
            and request.user.is_authenticated
            and request.user.role in {'admin', 'school_admin'}
        )


class ResultViewSet(viewsets.ModelViewSet):
    queryset = Result.objects.select_related('student__user', 'student__school', 'course__school').all()
    serializer_class = ResultSerializer
    permission_classes = [IsAdminOrTeacherResultPermission]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if user.role in {'admin', 'school_admin', 'principal'}:
            return self.queryset.filter(student__school=user.school)
        if user.role == 'teacher':
            return self.queryset.filter(course__teacher__user=user)
        if user.role == 'student':
            return self.queryset.published().filter(student__user=user)
        if user.role == 'parent':
            queryset = self.queryset.published().filter(student__guardians__user=user)
            selected_student = self.request.query_params.get('student')
            if selected_student:
                queryset = queryset.filter(student_id=selected_student)
            return queryset.distinct()
        return self.queryset.none()

    @action(detail=True, methods=['post'], permission_classes=[CanPublishResults])
    def publish(self, request, pk=None):
        result = self.get_object()
        if result.student.school_id != request.user.school_id:
            raise PermissionDenied('You can only publish results in your school.')
        before = {'is_published': result.is_published, 'marks': str(result.marks), 'grade': result.grade}
        result.is_published = True
        result.published_at = timezone.now()
        result.save(update_fields=['is_published', 'published_at'])
        record_audit(request.user, 'result.published', result, {
            'before': before,
            'after': {'is_published': result.is_published, 'marks': str(result.marks), 'grade': result.grade},
        })
        return Response(self.get_serializer(result).data)

    @action(detail=True, methods=['post'], permission_classes=[CanUnpublishResults])
    def unpublish(self, request, pk=None):
        result = self.get_object()
        if result.student.school_id != request.user.school_id:
            raise PermissionDenied('You can only unpublish results in your school.')
        reason = request.data.get('reason', '').strip()
        if not reason:
            return Response({'reason': 'A reason is required to unpublish a result.'}, status=400)
        before = {'is_published': result.is_published, 'published_at': result.published_at.isoformat() if result.published_at else None}
        result.is_published = False
        result.published_at = None
        result.save(update_fields=['is_published', 'published_at'])
        record_audit(request.user, 'result.unpublished', result, {
            'reason': reason,
            'before': before,
            'after': {'is_published': result.is_published, 'published_at': None},
        })
        return Response(self.get_serializer(result).data)

    def get_object(self):
        obj = super().get_object()
        if self.request.user.role in {'admin', 'school_admin', 'principal'}:
            if not school_admin_owns_record(self.request.user, obj):
                raise PermissionDenied('You do not have access to this result.')
        if self.request.user.role == 'student':
            assert_student_owns_record(self.request.user, obj)
        return obj

    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        year, term = resolve_school_period(course.school, academic_year=course.academic_year)
        result = serializer.save(academic_year=year, term=term)
        record_audit(self.request.user, 'result.created', result, {
            'after': {'marks': str(result.marks), 'grade': result.grade, 'is_published': result.is_published},
        })

    def perform_update(self, serializer):
        instance = serializer.instance
        before = {'marks': str(instance.marks), 'grade': instance.grade, 'is_published': instance.is_published}
        course = serializer.validated_data.get('course', serializer.instance.course)
        year, term = resolve_school_period(course.school, academic_year=course.academic_year)
        result = serializer.save(academic_year=year, term=term)
        record_audit(self.request.user, 'result.updated', result, {
            'before': before,
            'after': {'marks': str(result.marks), 'grade': result.grade, 'is_published': result.is_published},
        })
