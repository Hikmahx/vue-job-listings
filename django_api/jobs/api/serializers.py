from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from jobs.models import Job, JobDetails

class JobDetailsSerializer(serializers.ModelSerializer):
    externalApply = serializers.BooleanField(source='external_apply')
    experienceRequired = serializers.CharField(source='experience_required', allow_blank=True, required=False)
    foundedYear = serializers.IntegerField(source='founded_year', allow_null=True, required=False)
    
    class Meta:
        model = JobDetails
        fields = [
            'description',
            'requirements',
            'responsibilities',
            'externalApply',
            'apply',
            'experienceRequired',
            'foundedYear',
            'website'
        ]
    
    def validate_requirements(self, value):
        if not value:
            return {"content": "", "items": []}
        
        if not isinstance(value, dict):
            raise serializers.ValidationError("Requirements must be a dictionary")
        
        if 'content' not in value or 'items' not in value:
            raise serializers.ValidationError("Requirements must have both 'content' and 'items' fields")

        if not isinstance(value['items'], list):
            raise serializers.ValidationError("Requirements items must be a list")
        
        return value
    
    def validate_responsibilities(self, value):
        if not value:
            return {"content": "", "items": []}
        
        if not isinstance(value, dict):
            raise serializers.ValidationError("Responsibilities must be a dictionary")
        
        if 'content' not in value or 'items' not in value:
            raise serializers.ValidationError("Responsibilities must have both 'content' and 'items' fields")
        
        if not isinstance(value['items'], list):
            raise serializers.ValidationError("Responsibilities items must be a list")
        
        return value


class JobSerializer(serializers.ModelSerializer):
    postedAt = serializers.SerializerMethodField()
    new = serializers.SerializerMethodField()
    # Rename field from underscore to camelCase to match frontend and serializer
    minSalary = serializers.IntegerField(source='min_salary', required=False, default=0)
    maxSalary = serializers.IntegerField(source='max_salary', required=False, default=0)
    companySize = serializers.CharField(source='company_size', required=False, allow_blank=True)
    workType = serializers.CharField(source='work_type', required=False, allow_blank=True)
    
    # Removed read_only=True to allow writes for CRUD
    jobDetails = JobDetailsSerializer(source='details', required=False, allow_null=True)
    
    class Meta:
        model = Job
        fields = [
            "id",
            "company",
            "logo",
            'new',
            "featured",
            "position",
            "role",
            "level",
            "postedAt",
            "contract",
            "location",
            "currency", 
            "minSalary",
            "maxSalary",
            "timeframe",
            "market",
            "companySize",
            "workType",
            "skills",
            "jobDetails",
        ]
        # read_only_fields = ['jobDetails']
    
    def get_postedAt(self, obj):
        now = timezone.now()
        time_difference = now - obj.posted_at
        
        if time_difference.total_seconds() < 0:
            return "just now"
        
        seconds = time_difference.total_seconds()
        minutes = int(seconds // 60)
        hours = int(seconds // 3600)
        days = int(seconds // 86400)
        weeks = days // 7
        
        if minutes < 1:
            return "just now"
        elif minutes < 60:
            return f"{minutes}m ago"
        elif hours < 24:
            return f"{hours}h ago"
        elif days < 7:
            return f"{days}d ago"
        elif days < 30:
            weeks = days // 7
            return f"{weeks}w ago"
        elif days < 365:
            months = days // 30
            return f"{months}mo ago"
        else:
            years = int(days / 365.25)
            return f"{years}y ago"

    
    def get_new(self, obj):
        # Job is "new" if posted within the last 2 days
        return obj.posted_at >= timezone.now() - timedelta(days=2)

    def validate(self, data):
        min_salary = data.get("min_salary", 0)
        max_salary = data.get("max_salary", 0)
        currency = data.get("currency", "")
        timeframe = data.get("timeframe", "")
        
        has_salary = min_salary > 0 or max_salary > 0
        
        if has_salary and not currency:
            raise serializers.ValidationError("Currency is required when specifying salary range.")
        
        if has_salary and not timeframe:
            raise serializers.ValidationError("Timeframe is required when specifying salary range.")
        
        if min_salary > 0 and max_salary > 0 and min_salary > max_salary:
            raise serializers.ValidationError("Minimum salary cannot be greater than maximum salary.")
        
        return data
    


    def create(self, validated_data):
        details_data = validated_data.pop('details', None)
        job = Job.objects.create(**validated_data)

        if details_data:
            JobDetails.objects.create(job=job, **details_data)
        
        return job
    
    def update(self, instance, validated_data):
        details_data = validated_data.pop('details', None)
        
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        if details_data is not None:
            if instance.details:
                for attr, value in details_data.items():
                    setattr(instance.details, attr, value)
                instance.details.save()
            else:
                # Create new JobDetails
                JobDetails.objects.create(job=instance, **details_data)
        
        return instance