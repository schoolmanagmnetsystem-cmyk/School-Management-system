from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.utils import timezone


def get_user_school(user):
    if not user or not getattr(user, 'is_authenticated', False):
        return None
    return getattr(user, 'school', None)


def school_admin_owns_school(user, school):
    if not user or not user.is_authenticated:
        return False
    if user.role not in {'admin', 'school_admin', 'principal'}:
        return False
    if not school:
        return False
    return getattr(user, 'school', None) == school


def accountant_owns_school(user, school):
    if not user or not user.is_authenticated:
        return False
    if user.role != 'accountant':
        return False
    if not school:
        return False
    return getattr(user, 'school', None) == school


def accountant_owns_record(user, obj):
    if not user or not user.is_authenticated:
        return False
    if user.role != 'accountant':
        return False

    if hasattr(obj, 'school'):
        return accountant_owns_school(user, obj.school)
    if hasattr(obj, 'student'):
        return getattr(obj.student, 'school', None) == getattr(user, 'school', None)
    if hasattr(obj, 'user'):
        return getattr(obj.user, 'school', None) == getattr(user, 'school', None)
    return False


def receptionist_owns_school(user, school):
    if not user or not user.is_authenticated:
        return False
    if user.role != 'receptionist':
        return False
    if not school:
        return False
    return getattr(user, 'school', None) == school


def receptionist_owns_record(user, obj):
    if not user or not user.is_authenticated:
        return False
    if user.role != 'receptionist':
        return False

    if hasattr(obj, 'school'):
        return receptionist_owns_school(user, obj.school)
    if hasattr(obj, 'user'):
        return getattr(obj.user, 'school', None) == getattr(user, 'school', None)
    if hasattr(obj, 'student'):
        return getattr(obj.student, 'school', None) == getattr(user, 'school', None)
    if hasattr(obj, 'teacher'):
        return getattr(obj.teacher, 'school', None) == getattr(user, 'school', None)
    if hasattr(obj, 'course'):
        return getattr(obj.course, 'school', None) == getattr(user, 'school', None)
    return False


def school_admin_owns_record(user, obj):
    if not user or not user.is_authenticated:
        return False
    if user.role not in {'admin', 'school_admin', 'principal'}:
        return False

    if hasattr(obj, 'school'):
        return school_admin_owns_school(user, obj.school)
    if hasattr(obj, 'user'):
        return getattr(obj.user, 'school', None) == getattr(user, 'school', None)
    if hasattr(obj, 'student'):
        return getattr(obj.student, 'school', None) == getattr(user, 'school', None)
    if hasattr(obj, 'teacher'):
        return getattr(obj.teacher, 'school', None) == getattr(user, 'school', None)
    if hasattr(obj, 'course'):
        return getattr(obj.course, 'school', None) == getattr(user, 'school', None)
    return False


def student_owns_record(user, obj):
    if not user or not user.is_authenticated:
        return False
    if user.role != 'student':
        return False

    if hasattr(obj, 'user'):
        return obj.user == user
    if hasattr(obj, 'student'):
        return getattr(obj.student, 'user', None) == user
    if hasattr(obj, 'student_id'):
        return getattr(obj, 'student', None) and obj.student.user == user
    return False


def parent_owns_record(user, obj):
    if not user or not user.is_authenticated or user.role != 'parent':
        return False
    if hasattr(obj, 'guardians'):
        return obj.guardians.filter(user=user, school_id=user.school_id).exists()
    if hasattr(obj, 'student'):
        return parent_owns_record(user, obj.student)
    if hasattr(obj, 'enrollments'):
        from courses.models import CourseEnrollment
        return CourseEnrollment.objects.filter(
            course=obj, school_id=user.school_id, student__guardians__user=user, is_active=True
        ).exists()
    if hasattr(obj, 'course'):
        from courses.models import CourseEnrollment
        return CourseEnrollment.objects.filter(
            course=obj.course, school_id=user.school_id, student__guardians__user=user, is_active=True
        ).exists()
    if hasattr(obj, 'attendance'):
        return obj.attendance.filter(student__guardians__user=user).exists()
    return False


def assert_student_owns_record(user, obj):
    if not student_owns_record(user, obj):
        raise PermissionDenied('You do not have access to this record.')


class IsAdminOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in {'admin', 'school_admin'})


class IsSuperAdminOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'super_admin')


class IsSchoolAdminOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in {'admin', 'school_admin'})

    def has_object_permission(self, request, view, obj):
        return school_admin_owns_record(request.user, obj)


class IsAccountantFinanceOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'accountant')

    def has_object_permission(self, request, view, obj):
        return accountant_owns_record(request.user, obj)


class IsCourseAccess(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in {'admin', 'school_admin'}:
            return True
        return request.user.role in {'principal', 'receptionist', 'teacher', 'student', 'parent'} and request.method in SAFE_METHODS

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in {'admin', 'school_admin'}:
            return school_admin_owns_record(user, obj)
        if request.method not in SAFE_METHODS:
            return False
        if user.role == 'principal':
            return school_admin_owns_record(user, obj)
        if user.role == 'receptionist':
            return receptionist_owns_record(user, obj)
        if user.role == 'teacher':
            return obj.teacher is not None and obj.teacher.user_id == user.id
        if user.role == 'student':
            return obj.enrollments.filter(student__user=user, is_active=True).exists()
        if user.role == 'parent':
            return parent_owns_record(user, obj)
        return False


class IsAdminOrStudentInvoicePermission(BasePermission):
    """School administrators read, principals get aggregate summaries, and accountants manage school finance."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'accountant':
            return True
        if request.user.role in {'admin', 'school_admin'}:
            return request.method in SAFE_METHODS
        if request.user.role == 'principal':
            return request.method in SAFE_METHODS and getattr(view, 'action', None) == 'summary'
        if request.user.role == 'student' and request.method in SAFE_METHODS:
            return getattr(view, 'action', None) != 'summary'
        if request.user.role == 'parent' and request.method in SAFE_METHODS:
            return getattr(view, 'action', None) != 'summary'
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.role in {'admin', 'school_admin'}:
            return school_admin_owns_record(request.user, obj)
        if request.user.role == 'accountant':
            return accountant_owns_record(request.user, obj)
        if request.user.role == 'student' and request.method in SAFE_METHODS:
            return obj.student.user == request.user
        if request.user.role == 'parent' and request.method in SAFE_METHODS:
            return parent_owns_record(request.user, obj)
        return False


class IsAdminOrTeacherAttendancePermission(BasePermission):
    """Allow school admins and teachers to manage attendance only inside their school or course; principals read school attendance only."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in ['admin', 'school_admin', 'teacher']:
            return True
        if request.user.role == 'principal' and request.method in SAFE_METHODS:
            return True
        if request.user.role == 'student' and request.method in SAFE_METHODS:
            return True
        if request.user.role == 'parent' and request.method in SAFE_METHODS:
            return True
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.role in {'admin', 'school_admin'}:
            return school_admin_owns_record(request.user, obj)
        if request.user.role == 'teacher':
            return bool(obj.course.teacher and obj.course.teacher.user == request.user and (
                request.method in SAFE_METHODS or obj.date == timezone.localdate()
            ))
        if request.user.role == 'student' and request.method in SAFE_METHODS:
            return obj.student.user == request.user
        if request.user.role == 'parent' and request.method in SAFE_METHODS:
            return parent_owns_record(request.user, obj)
        return False


class IsAdminOrTeacherResultPermission(BasePermission):
    """School admins and teachers can manage results within their school; principals read only their school results."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in ['admin', 'school_admin', 'teacher']:
            return True
        if request.user.role == 'principal' and request.method in SAFE_METHODS:
            return True
        if request.user.role == 'student' and request.method in SAFE_METHODS:
            return True
        if request.user.role == 'parent' and request.method in SAFE_METHODS:
            return True
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.role in {'admin', 'school_admin'}:
            return school_admin_owns_record(request.user, obj)
        if request.user.role == 'principal' and request.method in SAFE_METHODS:
            return school_admin_owns_record(request.user, obj)
        if request.user.role == 'teacher':
            return bool(obj.course.teacher and obj.course.teacher.user == request.user and (
                request.method in SAFE_METHODS or not obj.is_published
            ))
        if request.user.role == 'student' and request.method in SAFE_METHODS:
            return obj.student.user == request.user
        if request.user.role == 'parent' and request.method in SAFE_METHODS:
            return parent_owns_record(request.user, obj)
        return False


class IsAdminOrTeacherReadOnly(BasePermission):
    """School admins, principals, accountants, and receptionists have school-scoped read access; teachers view their own assigned records; students see themselves."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in {'admin', 'school_admin'}:
            return True
        if request.user.role in {'principal', 'accountant', 'receptionist'} and request.method in SAFE_METHODS:
            return True
        if request.user.role == 'teacher' and request.method in SAFE_METHODS:
            return True
        if request.user.role == 'student' and request.method in SAFE_METHODS:
            return True
        if request.user.role == 'parent' and request.method in SAFE_METHODS:
            return True
        return False


class IsStudentDirectoryAccess(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in {'admin', 'school_admin'}:
            return True
        if request.user.role == 'receptionist' and request.method in SAFE_METHODS + ('PUT', 'PATCH'):
            return True
        return request.user.role in {'principal', 'accountant', 'teacher', 'student', 'parent'} and request.method in SAFE_METHODS

    def has_object_permission(self, request, view, obj):
        user = request.user
        if user.role in {'admin', 'school_admin'}:
            return school_admin_owns_record(user, obj)
        if user.role == 'principal' and request.method in SAFE_METHODS:
            return school_admin_owns_record(user, obj)
        if user.role == 'accountant' and request.method in SAFE_METHODS:
            return accountant_owns_record(user, obj)
        if user.role == 'receptionist':
            return request.method in SAFE_METHODS + ('PUT', 'PATCH') and receptionist_owns_record(user, obj)
        if user.role == 'teacher' and request.method in SAFE_METHODS:
            from courses.models import CourseEnrollment
            return CourseEnrollment.objects.filter(
                student=obj, school_id=user.school_id, course__teacher__user=user, is_active=True
            ).exists()
        if user.role == 'student' and request.method in SAFE_METHODS:
            return student_owns_record(user, obj)
        if user.role == 'parent' and request.method in SAFE_METHODS:
            return parent_owns_record(user, obj)
        return False


class IsStudentSelfOnly(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'student')

    def has_object_permission(self, request, view, obj):
        return student_owns_record(request.user, obj)
