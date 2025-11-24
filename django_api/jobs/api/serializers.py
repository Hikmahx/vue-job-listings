from rest_framework import serializers
from django.utils.timesince import timesince
from django.utils import timezone
from datetime import timedelta
from jobs.models import Job

class JobSerializer(serializers.ModelSerializer):
    postedAt = serializers.SerializerMethodField()
    new = serializers.SerializerMethodField()

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
            "skills",
        ]

    def get_postedAt(self, obj):
        delta = timesince(obj.posted_at).split(",")[0]

        parts = delta.split(" ")
        if len(parts) < 2:
            return "just now"
        
        value, unit = parts

        short = {
            "minute": "m",
            "minutes": "m",
            "hour": "h",
            "hours": "h",
            "day": "d",
            "days": "d",
            "week": "w",
            "weeks": "w",
            "month": "mo",
            "months": "mo",
            "year": "y",
            "years": "y",
        }.get(unit, "")

        return f"{value}{short} ago"

    
    def get_new(self, obj):
        # Job is "new" if posted within the last 2 days
        return obj.posted_at >= timezone.now() - timedelta(days=2)
