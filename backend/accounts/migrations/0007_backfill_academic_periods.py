from datetime import date

from django.db import migrations


def backfill_periods(apps, schema_editor):
    School = apps.get_model('accounts', 'School')
    Student = apps.get_model('students', 'Student')
    AcademicYear = apps.get_model('accounts', 'AcademicYear')
    Term = apps.get_model('accounts', 'Term')
    Course = apps.get_model('courses', 'Course')
    CourseEnrollment = apps.get_model('courses', 'CourseEnrollment')
    Attendance = apps.get_model('attendance', 'Attendance')
    Result = apps.get_model('results', 'Result')
    Invoice = apps.get_model('finance', 'Invoice')
    FeeStructure = apps.get_model('finance', 'FeeStructure')

    def get_year(school_id):
        year = AcademicYear.objects.filter(school_id=school_id, is_active=True).first()
        if year:
            return year
        return AcademicYear.objects.get_or_create(
            school_id=school_id,
            name='Legacy',
            defaults={
                'start_date': date(1, 1, 1),
                'end_date': date(9999, 12, 31),
                'is_active': False,
            },
        )[0]

    def get_term(year):
        term = Term.objects.filter(academic_year_id=year.pk).order_by('start_date').first()
        if term:
            return term
        return Term.objects.create(
            academic_year_id=year.pk,
            name='Legacy term',
            start_date=year.start_date,
            end_date=year.end_date,
        )

    for school in School.objects.all().iterator():
        has_records = (
            Course.objects.filter(school_id=school.pk).exists()
            or Student.objects.filter(school_id=school.pk).exists()
            or Attendance.objects.filter(student__school_id=school.pk).exists()
            or Result.objects.filter(student__school_id=school.pk).exists()
            or Invoice.objects.filter(school_id=school.pk).exists()
            or FeeStructure.objects.filter(school_id=school.pk).exists()
        )
        if has_records:
            year = get_year(school.pk)
            get_term(year)

    for course in Course.objects.filter(academic_year__isnull=True).iterator():
        year = get_year(course.school_id)
        Course.objects.filter(pk=course.pk).update(academic_year_id=year.pk)

    for enrollment in CourseEnrollment.objects.filter(academic_year__isnull=True).select_related('course').iterator():
        year = enrollment.course.academic_year or get_year(enrollment.school_id)
        term = get_term(year)
        CourseEnrollment.objects.filter(pk=enrollment.pk).update(academic_year_id=year.pk, term_id=term.pk)

    for model in (Attendance, Result):
        for record in model.objects.filter(academic_year__isnull=True).select_related('course', 'student').iterator():
            year = record.course.academic_year or get_year(record.student.school_id)
            term = get_term(year)
            model.objects.filter(pk=record.pk).update(academic_year_id=year.pk, term_id=term.pk)

    for invoice in Invoice.objects.filter(academic_year__isnull=True).select_related('student').iterator():
        year = get_year(invoice.school_id or invoice.student.school_id)
        term = get_term(year)
        Invoice.objects.filter(pk=invoice.pk).update(academic_year_id=year.pk, term_id=term.pk)

    for fee in FeeStructure.objects.filter(term__isnull=True).select_related('academic_year').iterator():
        FeeStructure.objects.filter(pk=fee.pk).update(term_id=get_term(fee.academic_year).pk)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0006_alter_customuser_role_academicyear_auditlog_guardian_and_more'),
        ('courses', '0005_course_academic_year_courseenrollment_academic_year_and_more'),
        ('attendance', '0002_attendance_academic_year_attendance_term'),
        ('results', '0003_result_academic_year_result_term'),
        ('finance', '0005_feestructure_term_invoice_academic_year_invoice_term'),
    ]

    operations = [
        migrations.RunPython(backfill_periods, migrations.RunPython.noop),
    ]


