"""Role-based access control and cross-tenant isolation tests.

Covers the highest-risk behaviours:
- unauthenticated requests are rejected
- students can only see themselves
- cross-school access is denied
- teachers only see their own students
- only principals/admins can publish results
- students/parents only see published results
- the student dashboard returns the student payload, not admin aggregates
"""
from datetime import date

from django.test import TestCase
from rest_framework.test import APIClient

from accounts.models import AcademicYear, CustomUser, Guardian, School, Term
from courses.models import Course, CourseEnrollment
from results.models import Result
from students.models import Student
from teachers.models import Teacher


class RBACBaseTestCase(TestCase):
    def setUp(self):
        self.client = APIClient()

        self.school_a = School.objects.create(name='School A', code='A')
        self.school_b = School.objects.create(name='School B', code='B')

        self.year_a = AcademicYear.objects.create(
            school=self.school_a, name='2025-A', start_date=date(2025, 1, 1),
            end_date=date(2025, 12, 31), is_active=True,
        )
        self.term_a = Term.objects.create(
            academic_year=self.year_a, name='Term 1', start_date=date(2025, 1, 1),
            end_date=date(2025, 6, 30),
        )
        self.year_b = AcademicYear.objects.create(
            school=self.school_b, name='2025-B', start_date=date(2025, 1, 1),
            end_date=date(2025, 12, 31), is_active=True,
        )
        self.term_b = Term.objects.create(
            academic_year=self.year_b, name='Term 1', start_date=date(2025, 1, 1),
            end_date=date(2025, 6, 30),
        )

        self.admin_a = self._user('admin_a', 'admin_a@example.com', 'school_admin', self.school_a)
        self.teacher_user_a = self._user('teacher_a', 'teacher_a@example.com', 'teacher', self.school_a)
        self.teacher_a = Teacher.objects.create(
            user=self.teacher_user_a, school=self.school_a, department='Science', designation='Instructor',
        )
        self.parent_a = self._user('parent_a', 'parent_a@example.com', 'parent', self.school_a)

        self.student_a = self._student('student_a', 'student_a@example.com', 'A-001', self.school_a)
        self.student_a2 = self._student('student_a2', 'student_a2@example.com', 'A-002', self.school_a)
        self.student_b = self._student('student_b', 'student_b@example.com', 'B-001', self.school_b)

        Guardian.objects.create(user=self.parent_a, school=self.school_a).students.add(self.student_a)

        self.course_a = Course.objects.create(
            school=self.school_a, academic_year=self.year_a, name='Physics', code='PHY-1', teacher=self.teacher_a,
        )
        CourseEnrollment.objects.create(
            school=self.school_a, course=self.course_a, student=self.student_a,
            academic_year=self.year_a, term=self.term_a,
        )

    def _user(self, username, email, role, school):
        return CustomUser.objects.create_user(
            username=username, email=email, password='pass-12345', role=role, school=school,
        )

    def _student(self, username, email, roll, school):
        user = self._user(username, email, 'student', school)
        return Student.objects.create(
            user=user, school=school, roll_number=roll, class_name='Grade 10', section='A',
        )

    def _ids(self, response):
        data = response.json()
        rows = data.get('results', data) if isinstance(data, dict) else data
        return [row.get('id') for row in rows]


class AuthenticationRequiredTests(RBACBaseTestCase):
    def test_students_require_authentication(self):
        response = self.client.get('/api/students/')
        self.assertIn(response.status_code, (401, 403))

    def test_dashboard_requires_authentication(self):
        response = self.client.get('/api/dashboard/')
        self.assertIn(response.status_code, (401, 403))


class LoginTests(RBACBaseTestCase):
    def test_login_with_username_returns_tokens_and_user(self):
        response = self.client.post(
            '/api/auth/login/',
            {'username': 'admin_a', 'password': 'pass-12345'},
            format='json',
        )
        self.assertEqual(response.status_code, 200)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['user']['role'], 'school_admin')

    def test_login_with_email_is_case_insensitive(self):
        response = self.client.post(
            '/api/auth/login/',
            {'username': 'ADMIN_A@EXAMPLE.COM', 'password': 'pass-12345'},
            format='json',
        )
        self.assertEqual(response.status_code, 200, response.data)
        self.assertEqual(response.data['user']['username'], 'admin_a')

    def test_invalid_login_returns_clear_unauthorized_response(self):
        response = self.client.post(
            '/api/auth/login/',
            {'username': 'admin_a', 'password': 'wrong-password'},
            format='json',
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.data['error'], 'Invalid credentials')

    def test_direct_model_account_with_hashed_password_can_login(self):
        user = CustomUser(
            username='direct_user',
            email='direct_user@example.com',
            role='principal',
            school=self.school_a,
        )
        user.set_password('pass-12345')
        user.save()

        response = self.client.post(
            '/api/auth/login/',
            {'username': 'direct_user@example.com', 'password': 'pass-12345'},
            format='json',
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data['user']['role'], 'principal')

    def test_plaintext_database_password_cannot_login(self):
        CustomUser.objects.create(
            username='plaintext_user',
            email='plaintext_user@example.com',
            password='pass-12345',
            role='principal',
            school=self.school_a,
        )

        response = self.client.post(
            '/api/auth/login/',
            {'username': 'plaintext_user', 'password': 'pass-12345'},
            format='json',
        )

        self.assertEqual(response.status_code, 401)

    def test_inactive_account_cannot_login(self):
        user = CustomUser(
            username='inactive_user',
            email='inactive_user@example.com',
            role='principal',
            school=self.school_a,
            is_active=False,
        )
        user.set_password('pass-12345')
        user.save()

        response = self.client.post(
            '/api/auth/login/',
            {'username': 'inactive_user', 'password': 'pass-12345'},
            format='json',
        )

        self.assertEqual(response.status_code, 401)

    def test_student_without_required_profile_gets_configuration_error(self):
        user = CustomUser(
            username='unconfigured_student',
            email='unconfigured_student@example.com',
            role='student',
            school=self.school_a,
        )
        user.set_password('pass-12345')
        user.save()

        response = self.client.post(
            '/api/auth/login/',
            {'username': 'unconfigured_student', 'password': 'pass-12345'},
            format='json',
        )

        self.assertEqual(response.status_code, 403)
        self.assertIn('setup is incomplete', response.data['error'])

    def test_all_supported_roles_can_login_when_configured(self):
        configured_users = {
            'super_admin': CustomUser.objects.create_user(
                username='role_super_admin',
                email='role_super_admin@example.com',
                password='pass-12345',
                role='super_admin',
            ),
            'admin': self._user('role_admin', 'role_admin@example.com', 'admin', self.school_a),
            'principal': self._user('role_principal', 'role_principal@example.com', 'principal', self.school_a),
            'accountant': self._user('role_accountant', 'role_accountant@example.com', 'accountant', self.school_a),
            'receptionist': self._user('role_receptionist', 'role_receptionist@example.com', 'receptionist', self.school_a),
            'teacher': self._user('role_teacher', 'role_teacher@example.com', 'teacher', self.school_a),
            'student': self._student('role_student', 'role_student@example.com', 'ROLE-001', self.school_a).user,
        }
        Teacher.objects.create(
            user=configured_users['teacher'],
            school=self.school_a,
            department='Science',
            designation='Instructor',
        )
        parent = self._user('role_parent', 'role_parent@example.com', 'parent', self.school_a)
        Guardian.objects.create(user=parent, school=self.school_a).students.add(self.student_a)
        configured_users['parent'] = parent

        for role, user in configured_users.items():
            with self.subTest(role=role):
                response = self.client.post(
                    '/api/auth/login/',
                    {'username': user.email, 'password': 'pass-12345'},
                    format='json',
                )
                self.assertEqual(response.status_code, 200)
                self.assertEqual(response.data['user']['role'], role)


class StudentIsolationTests(RBACBaseTestCase):
    def test_student_sees_only_self(self):
        self.client.force_authenticate(self.student_a.user)
        response = self.client.get('/api/students/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self._ids(response), [self.student_a.id])

    def test_student_cannot_read_another_student(self):
        self.client.force_authenticate(self.student_a.user)
        response = self.client.get(f'/api/students/{self.student_a2.id}/')
        self.assertIn(response.status_code, (403, 404))

    def test_student_dashboard_returns_student_payload(self):
        self.client.force_authenticate(self.student_a.user)
        response = self.client.get('/api/dashboard/')
        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn('student_profile', body)
        self.assertNotIn('total_students', body)


class SchoolIsolationTests(RBACBaseTestCase):
    def test_admin_lists_only_own_school_students(self):
        self.client.force_authenticate(self.admin_a)
        response = self.client.get('/api/students/')
        self.assertEqual(response.status_code, 200)
        returned = set(self._ids(response))
        self.assertIn(self.student_a.id, returned)
        self.assertIn(self.student_a2.id, returned)
        self.assertNotIn(self.student_b.id, returned)

    def test_admin_dashboard_counts_only_own_school(self):
        self.client.force_authenticate(self.admin_a)
        response = self.client.get('/api/dashboard/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json().get('total_students'), 2)


class TeacherScopeTests(RBACBaseTestCase):
    def test_teacher_sees_only_enrolled_students(self):
        self.client.force_authenticate(self.teacher_user_a)
        response = self.client.get('/api/students/')
        self.assertEqual(response.status_code, 200)
        returned = set(self._ids(response))
        self.assertIn(self.student_a.id, returned)
        self.assertNotIn(self.student_a2.id, returned)


class ResultPermissionTests(RBACBaseTestCase):
    def setUp(self):
        super().setUp()
        self.published = Result.objects.create(
            student=self.student_a, course=self.course_a, academic_year=self.year_a,
            term=self.term_a, marks='80.00', grade='A', is_published=True,
        )
        self.unpublished = Result.objects.create(
            student=self.student_a2, course=self.course_a, academic_year=self.year_a,
            term=self.term_a, marks='70.00', grade='B', is_published=False,
        )
        self.course_b = Course.objects.create(
            school=self.school_b, academic_year=self.year_b, name='Physics', code='PHY-B',
        )
        self.result_b = Result.objects.create(
            student=self.student_b, course=self.course_b, academic_year=self.year_b,
            term=self.term_b, marks='60.00', grade='C', is_published=False,
        )

    def test_student_cannot_publish(self):
        self.client.force_authenticate(self.student_a.user)
        response = self.client.post(f'/api/results/{self.unpublished.id}/publish/')
        self.assertIn(response.status_code, (403, 404))

    def test_student_sees_only_published_results(self):
        self.client.force_authenticate(self.student_a.user)
        response = self.client.get('/api/results/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self._ids(response), [self.published.id])

    def test_parent_sees_only_published_children_results(self):
        self.client.force_authenticate(self.parent_a)
        response = self.client.get('/api/results/')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self._ids(response), [self.published.id])

    def test_admin_cannot_publish_other_school_result(self):
        self.client.force_authenticate(self.admin_a)
        response = self.client.post(f'/api/results/{self.result_b.id}/publish/')
        self.assertIn(response.status_code, (403, 404))

    def test_admin_can_publish_own_school_result(self):
        self.client.force_authenticate(self.admin_a)
        response = self.client.post(f'/api/results/{self.unpublished.id}/publish/')
        self.assertEqual(response.status_code, 200)
        self.unpublished.refresh_from_db()
        self.assertTrue(self.unpublished.is_published)
