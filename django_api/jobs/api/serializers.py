from rest_framework import serializers
from django.utils.timesince import timesince
from django.utils import timezone
from datetime import timedelta
from jobs.models import Job

class JobSerializer(serializers.ModelSerializer):
    postedAt = serializers.SerializerMethodField()
    new = serializers.SerializerMethodField()
    # Rename field from underscore to camelCase to match frontend and serializer
    minSalary = serializers.IntegerField(source='min_salary', required=False, allow_null=True)
    maxSalary = serializers.IntegerField(source='max_salary', required=False, allow_null=True)
    companySize = serializers.CharField(source='company_size', required=False, allow_null=True)
    workType = serializers.CharField(source='work_type', required=False, allow_null=True)

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
            "market",
            "companySize",
            "workType",
            "skills",
        ]

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


    def validate(self, obj):
        if (obj.get("min_salary") or obj.get("max_salary")) and not obj.get("currency"):
            raise serializers.ValidationError("Currency is required when specifying salary range.")