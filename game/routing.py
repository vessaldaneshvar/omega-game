from django.urls import path
from . import consumers

websocket_urlpatterns = [
    path("game/creategroup/<str:groupname>/",consumers.creategroup),
    path("game/groups/",consumers.groups),
    path("game/joingroup/<str:groupname>/",consumers.join_group),
    path("game/data/<slug:token_group>/",consumers.game_function)
]