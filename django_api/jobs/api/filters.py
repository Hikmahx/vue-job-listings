# import django_filters
from django_filters import rest_framework as filters
from jobs.models import Job
                            
class JobFilter(filters.FilterSet):
    skills = filters.CharFilter(method="filter_skills")
    # the query string from the frontend would contain roles not role (also can be searched by role)
    roles = filters.BaseInFilter(field_name="role", lookup_expr="in")
    # Rename field from underscore to camelCase to match frontend and serializer (so these can't be in Meta)
    minSalary = filters.NumberFilter(field_name="min_salary", lookup_expr="gte")
    maxSalary = filters.NumberFilter(field_name="max_salary", lookup_expr="lte")
    markets = filters.BaseInFilter(field_name="market", lookup_expr="in")
    companySizes = filters.BaseInFilter(field_name="company_size", lookup_expr="in")
    workType = filters.CharFilter(field_name="work_type", lookup_expr="exact")
    class Meta:
        model = Job
        fields = {
            "level": ["exact", "in"],
            "contract": ["exact", "in"],
            "location": ["icontains"],
            # in can"t work for JSONField, 
            # "skill": ["in"]
            # "price": ["lt", "gt"],
            # "release_date": ["exact", "year__gt"], 
            "currency": ["exact"],
            # "market": ["exact", "in"],
        }
    
    def filter_skills(self, queryset, name, value):
            skills_list = value.split(",")
            return queryset.filter(skills__contains=skills_list)
    
    