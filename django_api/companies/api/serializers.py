from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from companies.models import Company

class CompanySerializer(serializers.ModelSerializer):
    teamSize = serializers.IntegerField(source='team_size')
    foundedYear = serializers.IntegerField(source='founded_year', allow_null=True, required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='created_at', read_only=True)

    class Meta:
        model = Company
        fields = [
            'id',
            'name',
            'logo',
            'description',
            'industry',
            'teamSize',
            'foundedYear',
            'website',
            'location',
            'createdAt',
            'updatedAt',
        ]
        
        read_only_fields = ('founder',)
        
    def create(self, validated_data):
        # Get the founder from the request
        founder = self.context['request'].founder
        
        # Check the number of companies the founder has
        number_of_companies = Company.objects.filter(founder=founder).count()
        if number_of_companies >= 3:
            raise serializers.ValidationError("A founder can create a maximum of 3 companies.")
        # return super().create(validated_data)
        
        return Company.objects.create(**validated_data)
  