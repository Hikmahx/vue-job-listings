from django.urls import path
from accounts.api.views import RegisterAPI, LoginAPI, LogoutAPI, UserProfileAPI, TokenRefreshAPIView

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('logout/', LogoutAPI.as_view(), name='logout'),
    path('profile/', UserProfileAPI.as_view(), name='profile'),
    path('token/refresh/', TokenRefreshAPIView.as_view(), name='token_refresh'),
]