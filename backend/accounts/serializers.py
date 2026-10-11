from rest_framework import serializers
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import AcademicYear, CustomUser, Guardian, School, Term
from accounts.periods import resolve_school_period
from students.models import Student
from teachers.models import Teacher

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)
    academic_year = serializers.PrimaryKeyRelatedField(
        queryset=AcademicYear.objects.all(), required=False, write_only=True
    )
    roll_number = serializers.CharField(required=False, allow_blank=True)
    class_name = serializers.CharField(required=False, allow_blank=True)
    section = serializers.CharField(required=False, allow_blank=True)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    department = serializers.CharField(required=False, allow_blank=True)
    designation = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    student_ids = serializers.PrimaryKeyRelatedField(queryset=Student.objects.all(), many=True, required=False, write_only=True)

    class Meta:
        model = CustomUser
        fields = (
            'id', 'username', 'email', 'password', 'first_name', 'last_name', 'role',
            'roll_number', 'class_name', 'section', 'date_of_birth', 'department', 'designation',
            'phone', 'student_ids', 'academic_year',
        )

    def validate(self, attrs):
        role = attrs.get('role')
        request = self.context.get('request')
        actor = getattr(request, 'user', None)
        if not actor or not actor.is_authenticated or actor.role not in {'admin', 'school_admin', 'receptionist'}:
            raise serializers.ValidationError('Only authorized school staff can create school accounts.')
        allowed_roles = {'student', 'teacher', 'principal', 'accountant', 'receptionist', 'parent'}
        if actor.role == 'receptionist':
            allowed_roles = {'student', 'parent'}
        if role not in allowed_roles:
            raise serializers.ValidationError({'role': 'This role cannot be assigned by a school administrator.'})
        if not actor.school_id or not actor.school.is_active:
            raise serializers.ValidationError('Your account is not assigned to an active school.')

        if role == 'student':
            academic_year = attrs.get('academic_year')
            try:
                if academic_year and (
                    academic_year.school_id != actor.school_id or not academic_year.is_active
                ):
                    raise ValidationError('Select an active academic year from your school.')
                resolve_school_period(actor.school, academic_year=academic_year)
            except ValidationError as exc:
                raise serializers.ValidationError({'academic_period': exc.messages})
            missing = []
            for field in ['roll_number', 'class_name', 'section']:
                if not attrs.get(field):
                    missing.append(field)
            if missing:
                raise serializers.ValidationError({field: 'This field is required for student registration.' for field in missing})
        elif role == 'teacher':
            missing = []
            for field in ['department', 'designation']:
                if not attrs.get(field):
                    missing.append(field)
            if missing:
                raise serializers.ValidationError({field: 'This field is required for teacher registration.' for field in missing})
        elif role == 'parent':
            student_ids = attrs.get('student_ids', [])
            if not student_ids:
                raise serializers.ValidationError({'student_ids': 'Link at least one student to a guardian account.'})
            if any(student.school_id != actor.school_id for student in student_ids):
                raise serializers.ValidationError({'student_ids': 'Guardians may only be linked to students in your school.'})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        request = self.context['request']
        role = validated_data.get('role')
        linked_students = validated_data.pop('student_ids', [])
        academic_year = validated_data.pop('academic_year', None)
        student_data = {
            'roll_number': validated_data.pop('roll_number', None),
            'class_name': validated_data.pop('class_name', None),
            'section': validated_data.pop('section', None),
            'date_of_birth': validated_data.pop('date_of_birth', None),
        }
        teacher_data = {
            'department': validated_data.pop('department', None),
            'designation': validated_data.pop('designation', None),
        }
        user = CustomUser.objects.create_user(**validated_data, school=request.user.school)

        if role == 'student':
            student = Student.objects.create(user=user, school=request.user.school, **student_data)
            year, term = resolve_school_period(request.user.school, academic_year=academic_year)
            from students.models import StudentAcademicHistory
            StudentAcademicHistory.objects.create(
                student=student, school=request.user.school, academic_year=year, term=term,
                action='admitted', to_class=student.class_name, to_section=student.section,
            )
        elif role == 'teacher':
            Teacher.objects.create(user=user, school=request.user.school, **teacher_data)
        elif role == 'parent':
            guardian = Guardian.objects.create(user=user, school=request.user.school)
            guardian.students.set(linked_students)

        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role', 'school')
        read_only_fields = fields


class SchoolSerializer(serializers.ModelSerializer):
    class Meta:
        model = School
        fields = ('id', 'name', 'code', 'address', 'is_active', 'created_at')
        read_only_fields = ('id', 'is_active', 'created_at')


class PlatformSchoolSerializer(SchoolSerializer):
    class Meta(SchoolSerializer.Meta):
        read_only_fields = ('id', 'created_at')


class SchoolAdminProvisionSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'password', 'first_name', 'last_name', 'phone')
        read_only_fields = ('id',)

    def create(self, validated_data):
        school = self.context['school']
        return CustomUser.objects.create_user(role='school_admin', school=school, **validated_data)


class UserManagementSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ('id', 'username', 'email', 'first_name', 'last_name', 'phone', 'role', 'school', 'is_active')
        read_only_fields = ('id', 'username', 'role', 'school')


class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = ('id', 'name', 'start_date', 'end_date', 'is_active')
        read_only_fields = ('id',)

    def validate(self, attrs):
        start = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        if start and end and end <= start:
            raise serializers.ValidationError({'end_date': 'End date must be after start date.'})
        return attrs


class TermSerializer(serializers.ModelSerializer):
    class Meta:
        model = Term
        fields = ('id', 'academic_year', 'name', 'start_date', 'end_date')
        read_only_fields = ('id',)

    def validate(self, attrs):
        year = attrs.get('academic_year', getattr(self.instance, 'academic_year', None))
        request = self.context.get('request')
        if year and request and year.school_id != request.user.school_id:
            raise serializers.ValidationError({'academic_year': 'Academic year must belong to your school.'})
        start = attrs.get('start_date', getattr(self.instance, 'start_date', None))
        end = attrs.get('end_date', getattr(self.instance, 'end_date', None))
        if year and start and end and (start < year.start_date or end > year.end_date or end <= start):
            raise serializers.ValidationError('Term dates must fall within the academic year.')
        return attrs


class GuardianSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)
    full_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', required=False)
    phone = serializers.CharField(source='user.phone', required=False, allow_blank=True)
    first_name = serializers.CharField(source='user.first_name', required=False, allow_blank=True)
    last_name = serializers.CharField(source='user.last_name', required=False, allow_blank=True)
    children = serializers.SerializerMethodField()

    class Meta:
        model = Guardian
        fields = ('id', 'username', 'full_name', 'email', 'phone', 'first_name', 'last_name', 'children', 'created_at')
        read_only_fields = ('id', 'username', 'full_name', 'children', 'created_at')

    def update(self, instance, validated_data):
        user_data = validated_data.pop('user', {})
        for field, value in user_data.items():
            setattr(instance.user, field, value)
        if user_data:
            instance.user.save(update_fields=list(user_data))
        return instance

    def get_children(self, guardian):
        return list(guardian.students.values('id', 'user__first_name', 'user__last_name', 'class_name', 'section'))
