from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from jobs.models import Job, JobDetails

class JobDetailsSerializer(serializers.ModelSerializer):
    externalApply = serializers.BooleanField(source='external_apply')
    experienceRequired = serializers.CharField(source='experience_required', allow_null=True)
    foundedYear = serializers.IntegerField(source='founded_year', allow_null=True)
    
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
    
    def to_representation(self, instance):
        data = super().to_representation(instance)
        
        if 'requirements' in data and isinstance(data['requirements'], dict):
            pass
        else:
            data['requirements'] = {
                "content": "",
                "items": []
            }
        
        if 'responsibilities' in data and isinstance(data['responsibilities'], dict):
            pass
        else:
            data['responsibilities'] = {
                "content": "",
                "items": []
            }
        
        return data
    
    def validate_requirements(self, value):
        """Validate requirements JSON structure"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Requirements must be a dictionary")
        
        if 'content' not in value or 'items' not in value:
            raise serializers.ValidationError("Requirements must have both 'content' and 'items' fields")

        if not isinstance(value['items'], list):
            raise serializers.ValidationError("Requirements items must be a list")
        
        return value
    
    def validate_responsibilities(self, value):
        """Validate responsibilities JSON structure"""
        if not isinstance(value, dict):
            raise serializers.ValidationError("Responsibilities must be a dictionary")
        
        if 'content' not in value:
            raise serializers.ValidationError("Responsibilities must have 'content' field")
        
        if 'items' not in value:
            raise serializers.ValidationError("Responsibilities must have 'items' field")
        
        if not isinstance(value['items'], list):
            raise serializers.ValidationError("Responsibilities items must be a list")
        
        return value


class JobSerializer(serializers.ModelSerializer):
    postedAt = serializers.SerializerMethodField()
    new = serializers.SerializerMethodField()
    # Rename field from underscore to camelCase to match frontend and serializer
    minSalary = serializers.IntegerField(source='min_salary', required=False, allow_null=True)
    maxSalary = serializers.IntegerField(source='max_salary', required=False, allow_null=True)
    companySize = serializers.CharField(source='company_size', required=False, allow_null=True)
    workType = serializers.CharField(source='work_type', required=False, allow_null=True)
    
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
        
        minutes = int(time_difference.total_seconds() // 60)
        hours = int(time_difference.total_seconds() // 3600)
        days = int(time_difference.total_seconds() // 86400)
        weeks = int(time_difference.total_seconds() // 604800)
        months = int(days // 30.44)
        years = int(days // 365.25)
        
        if minutes < 1:
            return "just now"
        elif minutes < 60:
            return f"{minutes}m ago"
        elif hours < 24:
            return f"{hours}h ago"
        elif days < 7:
            return f"{days}d ago"
        elif weeks < 4:
            return f"{weeks}w ago"
        elif months < 12:
            return f"{months}mo ago"
        else:
            return f"{years}y ago"

    
    def get_new(self, obj):
        # Job is "new" if posted within the last 2 days
        return obj.posted_at >= timezone.now() - timedelta(days=2)


    def validate(self, data):
        if (data.get("min_salary") or data.get("max_salary")) and not data.get("currency"):
            raise serializers.ValidationError("Currency is required when specifying salary range.")
        if (data.get("min_salary") or data.get("max_salary")) and not data.get("timeframe"):
            raise serializers.ValidationError("Timeframe is required when specifying salary range.")
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