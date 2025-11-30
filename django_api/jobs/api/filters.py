# import django_filters
from django_filters import rest_framework as filters
from jobs.models import Job
                            
class JobFilter(filters.FilterSet):
    skills = filters.CharFilter(method="filter_skills")

    class Meta:
        model = Job
        fields = {
            'level': ['exact', 'in'],
            'contract': ['exact', 'in'],
            'location': ['icontains'],
            'role': ['exact', 'in'],
            # in can't work for JSONField, 
            # 'skill': ['in']
            # 'price': ['lt', 'gt'],
            # 'release_date': ['exact', 'year__gt'], 
        }
    
    def filter_skills(self, queryset, name, value):
            skills_list = value.split(",")
            return queryset.filter(skills__contains=skills_list)
    
    