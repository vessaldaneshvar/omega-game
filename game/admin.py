from django.contrib import admin
from .models import Game , Group , Participant , Score

# Register your models here.

admin.site.register(Game)
admin.site.register(Group)
admin.site.register(Participant)
admin.site.register(Score)