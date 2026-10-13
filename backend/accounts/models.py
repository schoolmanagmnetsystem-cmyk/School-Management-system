from django.contrib.auth.models import AbstractUser, UserManager
from django.core.exceptions import ValidationError
from django.db import models
from django.db.models import Q
from django.utils import timezone


class School(models.Model):
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True, blank=True)
    address = models.CharField(max_length=255, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class AcademicYear(models.Model):
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='academic_years')
    name = models.CharField(max_length=30)
    start_date = models.DateField()
    end_date = models.DateField()
    is_active = models.BooleanField(default=False)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=('school', 'name'), name='unique_school_academic_year'),
            models.UniqueConstraint(fields=('school',), condition=Q(is_active=True), name='one_active_year_per_school'),
        ]
        ordering = ('-start_date',)

    def clean(self):
        if self.end_date <= self.start_date:
            raise ValidationError({'end_date': 'Academic year end date must be after its start date.'})

    def __str__(self):
        return f'{self.school}: {self.name}'


class Term(models.Model):
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='terms')
    name = models.CharField(max_length=50)
    start_date = models.DateField()
    end_date = models.DateField()

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=('academic_year', 'name'), name='unique_term_per_academic_year'),
        ]
        ordering = ('start_date',)

    def clean(self):
        if self.end_date <= self.start_date:
            raise ValidationError({'end_date': 'Term end date must be after its start date.'})
        if self.academic_year_id and (
            self.start_date < self.academic_year.start_date or self.end_date > self.academic_year.end_date
        ):
            raise ValidationError('Term dates must fall within the academic year.')

    def __str__(self):
        return f'{self.academic_year}: {self.name}'


class CustomUserManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        extra_fields['role'] = 'super_admin'
        extra_fields['school'] = None
        return super().create_superuser(username, email, password, **extra_fields)


class CustomUser(AbstractUser):
    ROLE_CHOICES = (
        ('super_admin', 'Super Admin'),
        ('school_admin', 'School Admin'),
        ('principal', 'Principal'),
        ('accountant', 'Accountant'),
        ('receptionist', 'Receptionist'),
        ('parent', 'Parent / Guardian'),
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    email = models.EmailField(unique=True)
    school = models.ForeignKey('School', on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    phone = models.CharField(max_length=30, blank=True)
    objects = CustomUserManager()

    class Meta:
        constraints = [
            models.CheckConstraint(
                condition=(Q(role='super_admin', school__isnull=True) | (~Q(role='super_admin') & Q(school__isnull=False))),
                name='user_school_required_except_super_admin',
            ),
        ]

    def clean(self):
        super().clean()
        if self.role == 'super_admin' and self.school_id is not None:
            raise ValidationError({'school': 'Super Admin accounts must not belong to a school.'})
        if self.role != 'super_admin' and self.school_id is None:
            raise ValidationError({'school': 'A school is required for school-scoped accounts.'})

    @property
    def is_school_admin(self):
        return self.role in {'admin', 'school_admin'}

    @property
    def is_principal(self):
        return self.role == 'principal'

    @property
    def is_accountant(self):
        return self.role == 'accountant'

    @property
    def is_receptionist(self):
        return self.role == 'receptionist'

    @property
    def is_super_admin(self):
        return self.role == 'super_admin'

    def __str__(self):
        return f"{self.username} ({self.role})"


class Guardian(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.PROTECT, related_name='guardian_profile')
    school = models.ForeignKey(School, on_delete=models.CASCADE, related_name='guardians')
    students = models.ManyToManyField('students.Student', related_name='guardians')
    created_at = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.user_id and self.user.school_id != self.school_id:
            raise ValidationError({'school': 'Guardian and school must match.'})
        if self.user_id and self.user.role != 'parent':
            raise ValidationError({'user': 'Guardian accounts must use the parent role.'})

    def __str__(self):
        return f'{self.user.get_full_name()} ({self.school.name})'


class AuditLog(models.Model):
    actor = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_events')
    school = models.ForeignKey(School, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_events')
    action = models.CharField(max_length=100)
    object_type = models.CharField(max_length=100)
    object_id = models.CharField(max_length=64, blank=True)
    details = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(default=timezone.now, db_index=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.action}: {self.object_type} {self.object_id}'
