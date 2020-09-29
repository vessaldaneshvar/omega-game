from django.shortcuts import render
from django.http import HttpResponseNotFound
from django.views.generic import TemplateView
from django.core.exceptions import ObjectDoesNotExist
from . import models as game_model

# Create your views here.


class LandingView(TemplateView):
    # model = game_model.Game
    template_name = "index.html"

    def get_context_data(self,**kwargs):
        context = super(LandingView, self).get_context_data(**kwargs)
        # context['groups'] = game_model.Group.objects.all()
        context['groups'] = game_model.Group.objects.filter(active="AW").order_by('-created_at')
        context['games'] = game_model.Game.objects.all()
        context['single_game'] = game_model.singleGame.objects.all()
        return context



def GameView(request,token):
    try:
        group_object = game_model.Group.objects.get(private_address=token)
        game_object = group_object.game.template
    except ObjectDoesNotExist:
        return HttpResponseNotFound()
    return render(request,game_object+".html")