# api/urls.py
from django.urls import path
from . import views

urlpatterns = [
    path('industries/', views.get_industries),
    path('industry/<str:industry>/<str:category>/', views.get_category),
    # path('save_selection/', views.save_selection),
    # path('focus-options/', views.get_focus_options),  # NEW ENDPOINT

    # path('save_full_idea/', views.save_full_idea_log),
    # path('generate-ideas/', views.generate_ideas, name='generate_ideas'),
    # path('generate-solution/', views.generate_solution, name='generate_solution'),

    path('priorities/', views.get_priorities),
    path('urgencies/', views.get_urgencies),
    path('affectedscope/', views.get_affectedscope),
    path('generate-ideas/', views.generate_ideas, name='generate_ideas'),




]
