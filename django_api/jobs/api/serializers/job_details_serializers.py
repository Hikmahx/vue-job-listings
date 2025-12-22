from rest_framework import serializers
from jobs.models import JobDetails

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

