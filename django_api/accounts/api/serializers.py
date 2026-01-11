from rest_framework import serializers
from accounts.models import User, JobSeekerProfile, TeamMemberProfile
from django.contrib.auth import authenticate


class JobSeekerProfileSerializer(serializers.ModelSerializer):
    experienceYears = serializers.IntegerField(source='experience_years')
    workExperience = serializers.JSONField(source='work_experience')
    portfolioUrl = serializers.URLField(source='portfolio_url', allow_blank=True)
    linkedinUrl = serializers.URLField(source='linkedin_url', allow_blank=True)
    githubUrl = serializers.URLField(source='github_url', allow_blank=True)
    desiredSalaryMin = serializers.IntegerField(source='desired_salary_min', allow_null=True)
    desiredSalaryMax = serializers.IntegerField(source='desired_salary_max', allow_null=True)
    openToRemote = serializers.BooleanField(source='open_to_remote')
    
    class Meta:
        model = JobSeekerProfile
        exclude = ['user']


class TeamMemberProfileSerializer(serializers.ModelSerializer):
    currentPosition = serializers.CharField(source='current_position', allow_blank=True)
    linkedinUrl = serializers.URLField(source='linkedin_url', allow_blank=True)
    twitterUrl = serializers.URLField(source='twitter_url', allow_blank=True)
    githubUrl = serializers.URLField(source='github_url', allow_blank=True)
    portfolioUrl = serializers.URLField(source='portfolio_url', allow_blank=True)
    experienceYears = serializers.IntegerField(source='experience_years')
    verifiedEmployer = serializers.BooleanField(source='verified_employer', read_only=True)

    isFounder = serializers.SerializerMethodField()
    companiesFounded = serializers.SerializerMethodField()
    companiesEmployed = serializers.SerializerMethodField()
    
    class Meta:
        model = TeamMemberProfile
        exclude = ['user']
    
    def get_isFounder(self, obj):
        return obj.user.company_memberships.filter(role="founder").exists()
    
    def get_companiesFounded(self, obj):
        from companies.models import Company
        from companies.api.serializers import CompanySerializer

        companies = Company.objects.filter(
            members__user=obj.user,
            members__role="founder"
        ).distinct()

        return CompanySerializer(companies, many=True).data

    def get_companiesEmployed(self, obj):
        from companies.models import Company
        from companies.api.serializers import CompanySerializer

        companies = Company.objects.filter(
            members__user=obj.user,
            members__role="employee"
        ).distinct()

        return CompanySerializer(companies, many=True).data


class UserSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name', read_only=True)
    firstName = serializers.CharField(source='first_name', read_only=True)
    lastName = serializers.CharField(source='last_name', read_only=True)
    phoneNumber = serializers.CharField(source='phone_number', read_only=True)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    
    jobSeekerProfile = JobSeekerProfileSerializer(source='job_seeker_profile', read_only=True)
    teamMemberProfile = TeamMemberProfileSerializer(source='team_member_profile', read_only=True)
    
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
            'createdAt',
            'jobSeekerProfile',
            'teamMemberProfile',
        ]


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    password2 = serializers.CharField(write_only=True)
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    phoneNumber = serializers.CharField(source='phone_number', required=False, allow_blank=True)

    class Meta:
        model = User
        fields = [
            'email',
            'firstName',
            'lastName',
            'password',
            'password2',
            'phoneNumber',
            'gender',
            'role',
            'location',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        
        user = User.objects.create_user(
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['first_name'],
            last_name=validated_data['last_name'],
            phone_number=validated_data.get('phone_number', ''),
            gender=validated_data.get('gender', ''),
            role=validated_data.get('role', 'job_seeker'),
            location=validated_data.get('location', ''),
        )
        if validated_data.get("role") == "job_seeker":
            JobSeekerProfile.objects.create(user=user)
        else:
            TeamMemberProfile.objects.create(user=user)
        
        return user


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        user = authenticate(email=data['email'], password=data['password'])
        if not user:
            raise serializers.ValidationError("Invalid email or password.")
        if not user.is_active:
            raise serializers.ValidationError("User account is disabled.")
        return user