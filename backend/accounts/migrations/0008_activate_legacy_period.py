from django.db import migrations


def activate_legacy_periods(apps, schema_editor):
    School = apps.get_model('accounts', 'School')
    AcademicYear = apps.get_model('accounts', 'AcademicYear')
    Term = apps.get_model('accounts', 'Term')

    for school in School.objects.filter(is_active=True).iterator():
        if AcademicYear.objects.filter(school_id=school.pk, is_active=True).exists():
            continue

        legacy_year = AcademicYear.objects.filter(
            school_id=school.pk,
            name='Legacy',
        ).first()
        if legacy_year and Term.objects.filter(academic_year_id=legacy_year.pk).exists():
            AcademicYear.objects.filter(pk=legacy_year.pk).update(is_active=True)


class Migration(migrations.Migration):

    dependencies = [
        ('accounts', '0007_backfill_academic_periods'),
    ]

    operations = [
        migrations.RunPython(activate_legacy_periods, migrations.RunPython.noop),
    ]
