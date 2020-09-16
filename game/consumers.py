from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
import json
from .models import Game , Group
import secrets

class creategroup(WebsocketConsumer):
    def connect(self):
        self.group_name = self.scope['url_route']['kwargs']['groupname']
        if self.group_name in self.channel_layer.groups.keys():
            self.close()
        else:
            async_to_sync(self.channel_layer.group_add)(
                self.group_name,
                self.channel_name
            )
            self.accept()

    def receive(self,text_data):
        # TODO: calculate capacity from db
        json_data = json.loads(text_data)
        self.game_name = json_data["game_name"]
        game_object = Game.objects.get(name=self.game_name)
        self.group_model_data = Group.objects.create(group_name=self.group_name,game = game_object,active="AW")
        async_to_sync(self.channel_layer.group_send)(
            "all",
            {
                "type" : "broadcast_create_group",
                "message_type" : "create_group",
                "group_name" : self.group_name,
                "game_name" : self.game_name
            }
        )
        
    
    def disconnect(self,close_code):
        self.group_model_data.active = "RJ"
        self.group_model_data.save()
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name,
            self.channel_name,
        )
        
        self.close()

    def ready_groups(self,event):
        self.group_model_data.active = "DG"
        self.group_model_data.private_address = event["slug_game"]
        self.group_model_data.save()
        self.send(json.dumps({
            "message_type":"ready_groups",
            "slug" : f'game/{event["slug_game"]}'

        }))


class groups(WebsocketConsumer):
    def connect(self):
        async_to_sync(self.channel_layer.group_add)(
            "all",
            self.channel_name
        )
        self.accept()

    def receive(self,text_data):
        pass

    
    def disconnect(self,close_code):
        async_to_sync(self.channel_layer.group_discard)(
            'all',
            self.channel_name,
        )
        
        self.close()

    def broadcast_create_group(self,event):
        self.send(
            json.dumps(
                {
                    "message_type" : event["message_type"],
                    "group_name" : event["group_name"],
                    "game_name" : event["game_name"]
                }
            )
        )


class join_group(WebsocketConsumer):
    def connect(self):
        self.group_name = self.scope['url_route']['kwargs']['groupname']
        if self.group_name in self.channel_layer.groups.keys():
            self.accept()
            async_to_sync(self.channel_layer.group_add)(
                self.group_name,
                self.channel_name
            )
            async_to_sync(self.channel_layer.group_send)(
                self.group_name,
                {
                    "type" : "ready_groups",
                    "slug_game" : secrets.token_urlsafe()
                }
            )

        else:
            self.close()

    def disconnect(self,close_code):
        async_to_sync(self.channel_layer.group_discard)(
            self.group_name,
            self.channel_name,
        )
        self.close()


    def ready_groups(self,event):
        self.send(json.dumps({
            "message_type":"ready_groups",
            "slug" : f"game/{event['slug_game']}"
        }))


class game_function(WebsocketConsumer):
    def connect(self):
        self.token_group = self.scope["url_route"]["kwargs"]["token_group"]
        self.accept()
        async_to_sync(self.channel_layer.group_add)(
            self.token_group,
            self.channel_name
        )
        self.send_user_number()
    
    def receive(self,text_data):
        json_data = json.loads(text_data)

        """Send Message To all Client Of Group"""
        if json_data["message_type"] == "echo_all":
            async_to_sync(self.channel_layer.group_send)(
                self.token_group,
                {"type" : "echo_all" , "data":json_data}
            )

        elif (json_data["message_type"] == "echo_user") and (json_data.get("user",None)):
            # TODO : Get Number User And Send data To User
            pass

        elif json_data["message_type"] == "finish":
            self.disconnect(1005)


    def disconnect(self,close_code):
        self.close()
        async_to_sync(self.channel_layer.group_discard)(
            self.token_group,
            self.channel_name
        )


    def send_user_number(self):
        print(self.channel_layer.groups)
        

    def echo_all(self,event):
        self.send(json.loads(event["data"]))