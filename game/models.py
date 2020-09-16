from django.db import models

# Create your models here.

class Game(models.Model):
    name = models.CharField(max_length=40,null=False,verbose_name="اسم بازی")
    describtions = models.TextField(blank=True)
    score = models.IntegerField()
    template = models.SlugField(null=True,unique=True)
    capacity = models.IntegerField()
    def __str__(self):
        return self.name
    

class Group(models.Model):
    group_name = models.CharField(max_length=40,null=False,verbose_name="اسم گروه")
    game = models.ForeignKey(Game,on_delete=models.CASCADE,verbose_name="اسم بازی")
    # Creator : USER
    created_at = models.DateTimeField(auto_now=True,verbose_name="زمان ایجاد")
    active = models.CharField(
        max_length=2,
        choices=[("AW","AWAITING"),("DG","DOING"),("DN","DONE"),("RJ","REJECT")]
    )
    private_address = models.SlugField(null=True,unique=True)

    def __str__(self):
        return self.group_name
    
# class Score(models.Model):




# TODO: CREATE MODEL FOR PARTICIPANT ::AFTER :: NO USER MODEL