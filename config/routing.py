from channels.routing import ProtocolTypeRouter , URLRouter
from game import routing as game_routing

application = ProtocolTypeRouter({
    'websocket' : URLRouter(game_routing.websocket_urlpatterns)
})