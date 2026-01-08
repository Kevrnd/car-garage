# Generated manually

from django.db import migrations, models


def fill_part_name(apps, schema_editor):
    """Заполняем поле name значением из part_code для существующих записей"""
    Part = apps.get_model('cars', 'Part')
    for part in Part.objects.filter(name__isnull=True):
        part.name = part.part_code or 'Запчасть'
        part.save()


class Migration(migrations.Migration):

    dependencies = [
        ('cars', '0004_remove_part_brand_part_name'),
    ]

    operations = [
        migrations.RunPython(fill_part_name, migrations.RunPython.noop),
        migrations.AlterField(
            model_name='part',
            name='name',
            field=models.CharField(max_length=200, verbose_name='Наименование'),
        ),
    ]


