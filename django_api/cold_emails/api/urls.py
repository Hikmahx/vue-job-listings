from django.urls import path
from .views import ColdEmailEntryListCreateAPI, ColdEmailEntryDetailAPI

urlpatterns = [
    path('', ColdEmailEntryListCreateAPI.as_view(), name='cold-email-list-create'),
    path('<int:pk>/', ColdEmailEntryDetailAPI.as_view(), name='cold-email-detail'),
]
