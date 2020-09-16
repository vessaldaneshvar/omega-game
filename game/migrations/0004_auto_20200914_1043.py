# Generated by Django 2.2.6 on 2020-09-14 06:13

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0003_auto_20200914_1036'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='url_game',
            field=models.SlugField(null=True, unique=True),
        ),
        migrations.AlterField(
            model_name='group',
            name='private_address',
            field=models.SlugField(null=True, unique=True),
        ),
    ]
