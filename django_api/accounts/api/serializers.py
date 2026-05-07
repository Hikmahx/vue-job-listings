from rest_framework import serializers
from accounts.models import User, JobSeekerProfile, TeamMemberProfile


class JobSeekerProfileSerializer(serializers.ModelSerializer):
    workExperience = serializers.JSONField(source='work_experience')
    desiredSalaryMin = serializers.IntegerField(source='desired_salary_min', allow_null=True)
    desiredSalaryMax = serializers.IntegerField(source='desired_salary_max', allow_null=True)
    openToRemote = serializers.BooleanField(source='open_to_remote')
    
    class Meta:
        model = JobSeekerProfile
        exclude = ['user']


class TeamMemberProfileSerializer(serializers.ModelSerializer):
    currentPosition = serializers.CharField(source='current_position', allow_blank=True)
    verifiedEmployer = serializers.BooleanField(source='verified_employer', read_only=True)

    isFounder = serializers.SerializerMethodField()
    companiesFounded = serializers.SerializerMethodField()
    companiesEmployed = serializers.SerializerMethodField()
    
    class Meta:
        model = TeamMemberProfile
        exclude = ['user']
    
    def get_isFounder(self, obj):
        return obj.user.company_memberships.filter(role='founder').exists()
    
    def get_companiesFounded(self, obj):
        from companies.models import Company
        from companies.api.serializers import CompanySerializer

        companies = Company.objects.filter(
            members__user=obj.user,
            members__role='founder'
        ).distinct()

        return CompanySerializer(companies, many=True).data

    def get_companiesEmployed(self, obj):
        from companies.models import Company
        from companies.api.serializers import CompanySerializer

        companies = Company.objects.filter(
            members__user=obj.user,
            members__role='employee'
        ).distinct()

        return CompanySerializer(companies, many=True).data


class UserSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source='full_name', read_only=True)
    firstName = serializers.CharField(source='first_name')
    lastName = serializers.CharField(source='last_name')
    phoneNumber = serializers.CharField(source='phone_number')
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    dateOfBirth = serializers.DateField(source='date_of_birth', allow_null=True)

    linkedinUrl = serializers.URLField(source='linkedin_url', allow_blank=True)
    twitterUrl = serializers.URLField(source='twitter_url', allow_blank=True)
    githubUrl = serializers.URLField(source='github_url', allow_blank=True)
    portfolioUrl = serializers.URLField(source='portfolio_url', allow_blank=True)
    experienceYears = serializers.IntegerField(source='experience_years')

    jobSeekerProfile = JobSeekerProfileSerializer(read_only=True)
    teamMemberProfile = TeamMemberProfileSerializer(read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id',
            'firstName',
            'lastName',
            'fullName',
            'email',
            'gender',
            'dateOfBirth',
            'role',
            'location',
            'phoneNumber',
            'linkedinUrl',
            'twitterUrl',
            'githubUrl',
            'portfolioUrl',
            'experienceYears',
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
    dateOfBirth = serializers.DateField(source='date_of_birth', allow_null=True, required=False)

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
            'dateOfBirth',
            'role',
            'location',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({'password': 'Passwords must match.'})
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
            date_of_birth=validated_data.get('date_of_birth'),
            role=validated_data.get('role', 'job_seeker'),
            location=validated_data.get('location', ''),
        )

        JobSeekerProfile.objects.create(user=user)
        TeamMemberProfile.objects.create(user=user)

        return user


class LoginSerializer(serializers.Serializer):
    print("LoginSerializer class loaded")  # Debug statement
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=1)

    def validate(self, data):
        # Check if user exists first
        try:
            user = User.objects.get(email=data.get('email'))
        except User.DoesNotExist:
            raise serializers.ValidationError(
                'Invalid email or password. If you don\'t have an account, please register.'
            )
        
        # Then verify password
        if not user.check_password(data.get('password')):
            raise serializers.ValidationError(
                'Invalid email or password. If you don\'t have an account, please register.'
            )
        
        if not user.is_active:
            raise serializers.ValidationError('User account is disabled. Please contact support.')
        return user