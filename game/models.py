from django.db import models

# Create your models here.

class game(models.Model):
    name = models.CharField(max_length=40,null=False,verbose_name="اسم بازی")
    describtions = models.TextField()
    score = models.IntegerField()

