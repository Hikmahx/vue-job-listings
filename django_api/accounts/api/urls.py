from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from accounts.api.views import RegisterAPI, LoginAPI, LogoutAPI, UserProfileAPI

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('logout/', LogoutAPI.as_view(), name='logout'),
    path('profile/', UserProfileAPI.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]