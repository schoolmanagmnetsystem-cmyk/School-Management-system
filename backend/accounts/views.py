from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import serializers, viewsets
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from rest_framework.permissions import BasePermission, SAFE_METHODS
from .serializers import AcademicYearSerializer, GuardianSerializer, PlatformSchoolSerializer, RegisterSerializer, SchoolAdminProvisionSerializer, SchoolSerializer, TermSerializer, UserManagementSerializer, UserSerializer
from .models import AcademicYear, AuditLog, CustomUser, Guardian, School, Term
from core.permissions import IsAdminOnly, IsSchoolAdminOnly, IsSuperAdminOnly
from .audit import record_audit


class SchoolAccessPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role == 'super_admin':
            return request.method in SAFE_METHODS or request.method in {'POST', 'PUT', 'PATCH'}
        if request.user.role == 'principal':
            return request.method in SAFE_METHODS
        if request.user.role in {'admin', 'school_admin'}:
            return request.method in SAFE_METHODS or request.method in {'PUT', 'PATCH'}
        return False

    def has_object_permission(self, request, view, obj):
        if request.user.role == 'super_admin':
            return True
        if request.user.role == 'principal' and request.method in SAFE_METHODS:
            return request.user.school_id == obj.pk
        return request.user.role in {'admin', 'school_admin'} and request.user.school_id == obj.pk


class SchoolStaffProvisionPermission(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role in {'admin', 'school_admin', 'receptionist'})


class SchoolViewSet(viewsets.ModelViewSet):
    queryset = School.objects.all()
    serializer_class = SchoolSerializer
    permission_classes = [SchoolAccessPermission]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'super_admin':
            return self.queryset
        return self.queryset.filter(pk=user.school_id)

    def get_serializer_class(self):
        if self.request.user.role == 'super_admin':
            return PlatformSchoolSerializer
        return SchoolSerializer

    def perform_create(self, serializer):
        if self.request.user.role != 'super_admin':
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Only Super Admin can create schools.')
        school = serializer.save()
        record_audit(self.request.user, 'school.created', school)

    def perform_update(self, serializer):
        before = {'is_active': serializer.instance.is_active}
        school = serializer.save()
        record_audit(self.request.user, 'school.updated', school, {
            'before': before,
            'after': {'is_active': school.is_active},
        })

    @action(detail=True, methods=['post'], permission_classes=[IsSuperAdminOnly], url_path='admins')
    def create_school_admin(self, request, pk=None):
        school = self.get_object()
        serializer = SchoolAdminProvisionSerializer(data=request.data, context={'school': school})
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        record_audit(request.user, 'school_admin.created', user, {'role': user.role, 'school_id': school.pk})
        return Response(UserSerializer(user).data, status=201)


class UserDirectoryPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.method == 'GET':
            return request.user.role in {'super_admin', 'admin', 'school_admin'}
        if request.method == 'POST':
            return request.user.role in {'admin', 'school_admin'}
        if request.method in {'PATCH', 'PUT'}:
            return request.user.role in {'admin', 'school_admin', 'super_admin'}
        return False


class UserDetailView(APIView):
    permission_classes = [IsAuthenticated, UserDirectoryPermission]

    def get_queryset(self, request):
        if request.user.role == 'super_admin':
            return CustomUser.objects.all()
        return CustomUser.objects.filter(school=request.user.school)

    def get_object(self, request, pk):
        from django.shortcuts import get_object_or_404
        return get_object_or_404(self.get_queryset(request), pk=pk)

    def patch(self, request, pk):
        user = self.get_object(request, pk)
        serializer = UserManagementSerializer(user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        record_audit(request.user, 'user.updated', user, {'is_active': user.is_active})
        return Response(UserSerializer(user).data)


class SchoolAcademicAccessPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in {'admin', 'school_admin'}:
            return True
        return request.user.role in {'principal', 'accountant', 'receptionist'} and request.method in SAFE_METHODS


class SchoolAcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer
    permission_classes = [SchoolAcademicAccessPermission]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']

    def get_queryset(self):
        return self.queryset.filter(school_id=self.request.user.school_id)

    def perform_create(self, serializer):
        serializer.save(school=self.request.user.school)


class SchoolTermViewSet(viewsets.ModelViewSet):
    queryset = Term.objects.select_related('academic_year')
    serializer_class = TermSerializer
    permission_classes = [SchoolAcademicAccessPermission]
    http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']

    def get_queryset(self):
        return self.queryset.filter(academic_year__school_id=self.request.user.school_id)


class GuardianAccessPermission(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.role in {'admin', 'school_admin', 'receptionist'}:
            return request.method in SAFE_METHODS or request.method in {'PUT', 'PATCH'}
        return request.user.role in {'principal', 'parent'} and request.method in SAFE_METHODS


class GuardianViewSet(viewsets.ModelViewSet):
    queryset = Guardian.objects.select_related('user', 'school').prefetch_related('students')
    serializer_class = GuardianSerializer
    permission_classes = [GuardianAccessPermission]
    http_method_names = ['get', 'put', 'patch', 'head', 'options']

    def get_queryset(self):
        user = self.request.user
        if user.role == 'parent':
            return self.queryset.filter(user=user, school_id=user.school_id)
        return self.queryset.filter(school_id=user.school_id)

class RegisterView(APIView):
    permission_classes = [IsAuthenticated, SchoolStaffProvisionPermission]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()
            record_audit(request.user, 'user.created', user, {'role': user.role})
            return Response(UserSerializer(user).data, status=201)
        return Response(serializer.errors, status=400)

class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        identifier = str(request.data.get('username', '')).strip()
        password = request.data.get('password')
        username = identifier
        if '@' in identifier:
            matched_user = CustomUser.objects.filter(email__iexact=identifier).only('username').first()
            username = matched_user.username if matched_user else identifier
        user = authenticate(username=username, password=password)
        if user:
            valid_roles = {role for role, _ in CustomUser.ROLE_CHOICES}
            if user.role not in valid_roles:
                return Response({'error': 'This account has an unsupported role. Contact a school administrator.'}, status=403)
            if user.role != 'super_admin' and (not user.school_id or not user.school.is_active):
                return Response({'error': 'This account is not assigned to an active school.'}, status=403)
            profile_names = {
                'student': 'student_profile',
                'teacher': 'teacher_profile',
                'parent': 'guardian_profile',
            }
            profile_name = profile_names.get(user.role)
            if profile_name and not hasattr(user, profile_name):
                return Response({'error': 'This account setup is incomplete. Contact a school administrator.'}, status=403)
            refresh = RefreshToken.for_user(user)
            return Response({
                'user': UserSerializer(user).data,
                'access': str(refresh.access_token),
                'refresh': str(refresh),
            })
        return Response({'error': 'Invalid credentials'}, status=401)

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response(UserSerializer(request.user).data)

class UserListView(APIView):
    permission_classes = [IsAuthenticated, UserDirectoryPermission]

    def get(self, request):
        users = CustomUser.objects.all() if request.user.role == 'super_admin' else CustomUser.objects.filter(school=request.user.school)
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        if request.user.role == 'super_admin':
            return Response({'detail': 'Create school administrators through /schools/{id}/admins/.'}, status=405)
        serializer = RegisterSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            user = serializer.save()
            record_audit(request.user, 'user.created', user, {'role': user.role})
            return Response(UserSerializer(user).data, status=201)
        return Response(serializer.errors, status=400)

class ValidateTokenView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({
            'valid': True,
            'user': UserSerializer(request.user).data,
        })


class AuditLogPermission(BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.role == 'super_admin')


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    class AuditLogSerializer(serializers.ModelSerializer):
        class Meta:
            model = AuditLog
            fields = ('id', 'actor_id', 'school_id', 'action', 'object_type', 'object_id', 'details', 'created_at')

    queryset = AuditLog.objects.select_related('actor', 'school')
    serializer_class = AuditLogSerializer
    permission_classes = [AuditLogPermission]
