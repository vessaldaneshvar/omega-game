from django.urls import path
from . import views

urlpatterns = [
    path("",views.LandingView.as_view()),
    path("game/<slug:token>/",views.GameView)
]