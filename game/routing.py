from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path("game/groups/",consumers.groups),
    path("game/data/<slug:token_group>/",consumers.game_function)
]