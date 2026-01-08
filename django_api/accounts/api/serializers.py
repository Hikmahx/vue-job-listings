from rest_framework import serializers
from accounts.models import User, JobSeekerProfile, FounderProfile
from django.contrib.auth import authenticate

class UserSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name', read_only=True)
    firstName = serializers.CharField(source='first_name', read_only=True)
    lastName = serializers.CharField(source='last_name', read_only=True)
    phoneNumber = serializers.CharField(source='phone_number', allow_blank=True, allow_null=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'firstName',
            'lastName',
            'fullName',
            'email',
            'gender',
            'role',
            'location',
            'phoneNumber',
        ]
        
        
# We exclude user because: user already knows themselves & to prevents accidental reassignment       
class JobSeekerProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobSeekerProfile
        exclude = ['user']


class FounderProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = FounderProfile
        exclude = ['user']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'email',
            'first_name',
            'last_name',
            'password',
            'password2',
            'phone_number',
            'role',
            'location',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError("Passwords must match.")
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')

        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data.get('phone_number', ''),
            role=validated_data.get('role', 'job_seeker'),
            location=validated_data.get('location', ''),
        )
        return user
    
class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid credentials.")
        return user


class JWTSerializer(serializers.Serializer):
    token = serializers.CharField()


class LogoutSerializer(serializers.Serializer):
    pass