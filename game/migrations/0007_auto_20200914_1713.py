# Generated by Django 2.2.6 on 2020-09-14 12:43

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('game', '0006_game_capacity'),
    ]

    operations = [
        migrations.AlterField(
            model_name='game',
            name='capacity',
            field=models.IntegerField(),
        ),
    ]
