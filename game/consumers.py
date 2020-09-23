from channels.generic.websocket import WebsocketConsumer
from django.core.exceptions import ObjectDoesNotExist
from asgiref.sync import async_to_sync
import json
from .models import Game , Group , Participant , Score
import secrets
from hashlib import sha1

class groups(WebsocketConsumer):
    def connect(self):
        async_to_sync(self.channel_layer.group_add)(
            "all",
            self.channel_name
        )
        self.accept()

    def receive(self,text_data):
        json_data = json.loads(text_data)
        message_type = json_data["message_type"]
        '''Check Type Of Message Received'''
        if message_type == "create_group":
            self.create_group(json_data)
        elif message_type == "join_group":
            self.join_group(json_data)

    
    def disconnect(self,close_code):
        async_to_sync(self.channel_layer.group_discard)(
            'all',
            self.channel_name,
        )
        if hasattr(self,'creator'): 
            self.group_model_data.active = "RJ"
            self.group_model_data.save()
            async_to_sync(self.channel_layer.group_discard)(
            self.group_name_created_sha1,
            self.channel_name,
            )
        if hasattr(self,'joined'):
            async_to_sync(self.channel_layer.group_discard)(
            self.group_name_joined_sha1,
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

    def create_group(self,json_data):
        try:
            Group.objects.get(group_name=json_data["group_name"],active="AW")
            return self.same_group_name()
        except ObjectDoesNotExist:
            pass

        self.creator = True
        self.group_name_created = json_data["group_name"]
        self.group_name_created_sha1 = sha1(json_data["group_name"].encode()).hexdigest()
        self.game_name = json_data["game_name"]
        game_object = Game.objects.get(name=self.game_name)
        self.group_model_data = Group.objects.create(group_name=self.group_name_created,game = game_object,active="AW",password=json_data["game_password"])

        async_to_sync(self.channel_layer.group_add)(
        self.group_name_created_sha1,
        self.channel_name
        )
        async_to_sync(self.channel_layer.group_send)(
            "all",
            {
                "type" : "broadcast_create_group",
                "message_type" : "broadcast_newgroup",
                "group_name" : self.group_name_created,
                "game_name" : self.game_name
            }
        )

    def same_group_name(self):
        self.send(json.dumps({
            "message_type" : "same_group_name"
        }))

    def incorrect_password(self):
        self.send(json.dumps({
            "message_type" : "incorrect_password"
        }))

    def join_group(self,json_data):
        try:
            Group.objects.get(group_name=json_data["group_name"],password=json_data["game_password"],active="AW")
        except ObjectDoesNotExist:
            return self.incorrect_password()
        self.joined = True
        self.group_name_joined = json_data["group_name"]
        self.group_name_joined_sha1 = sha1(json_data["group_name"].encode()).hexdigest()
        # TODO : Condition for not accept over capacity in group
        async_to_sync(self.channel_layer.group_add)(
                self.group_name_joined_sha1,
                self.channel_name
            )
        # TODO : Condition For JoinedCount == capacity
        async_to_sync(self.channel_layer.group_send)(
                self.group_name_joined_sha1,
                {
                    "type" : "ready_groups",
                    "slug_game" : secrets.token_urlsafe()
                }
            )

    def ready_groups(self,event):
        if hasattr(self,'creator'):
            self.group_model_data.active = "DG"
            self.group_model_data.private_address = event["slug_game"]
            self.group_model_data.save()
        self.send(json.dumps({
            "message_type":"ready_groups",
            "slug" : f"game/{event['slug_game']}"
        }))


class game_function(WebsocketConsumer):
    def connect(self):
        self.token_group = self.scope["url_route"]["kwargs"]["token_group"]
        self.group_object = Group.objects.get(private_address=self.token_group)
        participantobjects = Participant.objects.filter(group=self.group_object)
        if len(participantobjects) >= self.group_object.game.capacity:
            self.close()    
            return
        self.userid = len(participantobjects)
        self.participant = Participant.objects.create(group=self.group_object,channel_name=self.channel_name,index=self.userid)
        self.accept()
        async_to_sync(self.channel_layer.group_add)(
            self.token_group,
            self.channel_name
        )
        self.send_user_number()
    
    def receive(self,text_data):
        json_data = json.loads(text_data)
        print(text_data)
        """Send Message To all Client Of Group"""
        if json_data["message_type"] == "echo_all":
            async_to_sync(self.channel_layer.group_send)(
                self.token_group,
                {"type" : "echo_all" , "data":json_data}
            )

        elif (json_data["message_type"] == "echo_other"):
            # TODO : Get Number User And Send data To User
            async_to_sync(self.channel_layer.group_send)(
                self.token_group,
                {"type" : "echo_other" , "channel_name" : self.channel_name,"data":json_data}
            )

        elif json_data["message_type"] == "new_token":
            pass
            # TODO :: NEW GAME

        elif (json_data["message_type"] == "save_score") and (json_data.get("winner",None)):
            if json_data["winner"] == "me":
                result = "S"
            elif json_data["winner"] == "competitor":
                result = "F"
            Score.objects.create(group=self.group_object,user=self.participant,result=result)

    def disconnect(self,close_code):
        self.close()
        async_to_sync(self.channel_layer.group_discard)(
            self.token_group,
            self.channel_name
        )


    def send_user_number(self):
        self.send(json.dumps({"action":"start_game","userid":self.userid}))
        

    def echo_all(self,event):
        self.send(json.dumps(event["data"]))

    def echo_other(self,event):
        if self.channel_name != event["channel_name"]:
            self.send(json.dumps(event["data"]))
