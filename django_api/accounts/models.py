from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('Email is required')
        email = self.normalize_email(email)
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    """Base user model for all users"""
    
    ROLE_CHOICES = [
        ('job_seeker', 'Job Seeker'),
        ('team_member', 'Team Member'),  # Works at companies (founders or employees)
    ]
    
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('other', 'Other'),
    ]
    
    first_name = models.CharField(max_length=50)
    last_name = models.CharField(max_length=50)
    email = models.EmailField(unique=True)
    phone_number = models.CharField(max_length=20, blank=True)
    gender = models.CharField(max_length=20, choices=GENDER_CHOICES, blank=True)
    
    bio = models.TextField(blank=True)
    experience_years = models.IntegerField(default=0)
    skills = models.JSONField(default=list)

    linkedin_url = models.URLField(blank=True)
    twitter_url = models.URLField(blank=True)
    github_url = models.URLField(blank=True)
    portfolio_url = models.URLField(blank=True)
    
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='job_seeker')
    location = models.CharField(max_length=100, blank=True)
    
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    
    objects = UserManager()
    
    class Meta:
        db_table = 'users'
        verbose_name = 'User'
        verbose_name_plural = 'Users'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.email
    
    def get_full_name(self):
        return f"{self.first_name} {self.last_name}"
    
    def get_short_name(self):
        return self.first_name
    
    @property
    def full_name(self):
        return self.get_full_name()


class JobSeekerProfile(models.Model):
    """Extended profile for job seekers"""
    user = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='job_seeker_profile'
    )
    
    resume = models.FileField(upload_to='resumes/', blank=True, null=True)
    work_experience = models.JSONField(default=list)
    desired_salary_min = models.IntegerField(null=True, blank=True)
    desired_salary_max = models.IntegerField(null=True, blank=True)
    open_to_remote = models.BooleanField(default=True)
    
    class Meta:
        db_table = 'job_seeker_profiles'
        verbose_name = 'Job Seeker Profile'
        verbose_name_plural = 'Job Seeker Profiles'
    
    def __str__(self):
        return f"{self.user.full_name} - Job Seeker"
class TeamMemberProfile(models.Model):
    """Extended profile for team members (founders and employees)"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="team_member_profile")
    current_position = models.CharField(max_length=100, blank=True)
    verified_employer = models.BooleanField(default=False)
    
    class Meta:
        db_table = 'team_member_profiles'
        verbose_name = 'Team Member Profile'
        verbose_name_plural = 'Team Member Profiles'
    def __str__(self):
        return f"{self.user.full_name} - Team Member"