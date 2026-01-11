from rest_framework import serializers
from companies.models import Company, CompanyMember

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
            'slug',
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
        read_only_fields = ['slug']
        
    def validate(self, attrs):
        """
        A user can only FOUND (not just join) up to 3 companies.
        """
        request = self.context.get('request')
        if request and request.method == 'POST':
            user = request.user

            founded_count = CompanyMember.objects.filter(
                user=user,
                role="founder"
            ).count()

            if founded_count >= 3:
                raise serializers.ValidationError(
                    "You can only found a maximum of 3 companies."
                )

        return attrs


class CompanyMemberSerializer(serializers.ModelSerializer):
    userId = serializers.IntegerField(source="user.id", read_only=True)
    fullName = serializers.CharField(source="user.full_name", read_only=True)
    email = serializers.EmailField(source="user.email", read_only=True)

    class Meta:
        model = CompanyMember
        fields = [
            "id",
            "userId",
            "fullName",
            "email",
            "role",
            "permission",
            "title",
            "joined_at",
        ]


class CompanyDetailSerializer(CompanySerializer):
    """
    Same company data, but now with people attached.
    """
    founders = serializers.SerializerMethodField()
    team = serializers.SerializerMethodField()

    class Meta(CompanySerializer.Meta):
        fields = CompanySerializer.Meta.fields + ["founders", "team"]

    def get_founders(self, obj):
        founders = obj.members.filter(role="founder")
        return CompanyMemberSerializer(founders, many=True).data

    def get_team(self, obj):
        employees = obj.members.filter(role="employee")
        return CompanyMemberSerializer(employees, many=True).data
