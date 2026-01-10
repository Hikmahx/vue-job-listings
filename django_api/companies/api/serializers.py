from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from companies.models import Company

class CompanySerializer(serializers.ModelSerializer):
    teamSize = serializers.IntegerField(source='team_size')
    foundedYear = serializers.IntegerField(source='founded_year', allow_null=True, required=False)
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    updatedAt = serializers.DateTimeField(source='updated_at', read_only=True)

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
        
    def validate(self, attrs):
        request = self.context['request']
        user = request.user
        if request.method == 'POST':
        # Max 3 companies per founder
            if Company.objects.filter(founder=user).count() >= 3:
                raise serializers.ValidationError("A founder can create a maximum of 3 companies.")

        return attrs
  