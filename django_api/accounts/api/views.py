from rest_framework import generics, permissions, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.models import User
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    LoginSerializer,
)


class RegisterAPI(generics.CreateAPIView):
    """User registration endpoint"""
    authentication_classes = []
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    
    # create method overridden to return tokens upon registration (rather than just user data)
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Return user data with tokens 
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_201_CREATED)


class LoginAPI(generics.GenericAPIView):
    """User login endpoint"""
    authentication_classes = []
    serializer_class = LoginSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except ValidationError as exc:
            errors = exc.detail
            if isinstance(errors, dict):
                errors = errors.get('message') or errors.get('non_field_errors') or errors
            if isinstance(errors, list) and len(errors) == 1:
                errors = errors[0]
            return Response(
                {'message': errors},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = serializer.validated_data
        refresh = RefreshToken.for_user(user)

        return Response({
            'user': UserSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        }, status=status.HTTP_200_OK)


class TokenRefreshAPIView(TokenRefreshView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]


class LogoutAPI(generics.GenericAPIView):
    """
    Logout endpoint (JWT is stateless, so this just returns success)
    Frontend should delete the token from storage
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        # JWT tokens are stateless - just return success
        # Frontend handles token deletion
        return Response({
            'message': 'Logged out successfully'
        }, status=status.HTTP_200_OK)


class UserProfileAPI(generics.RetrieveUpdateAPIView):
    """Get and update current user profile"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user