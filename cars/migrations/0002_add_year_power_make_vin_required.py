# Generated manually

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('cars', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='car',
            name='power',
            field=models.IntegerField(blank=True, null=True, verbose_name='Мощность (л.с.)'),
        ),
        migrations.AddField(
            model_name='car',
            name='year',
            field=models.IntegerField(blank=True, null=True, verbose_name='Год выпуска'),
        ),
        migrations.AlterField(
            model_name='car',
            name='vin',
            field=models.CharField(max_length=17, verbose_name='VIN'),
        ),
    ]

