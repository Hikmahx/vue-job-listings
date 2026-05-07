# import django_filters
from django_filters import rest_framework as filters
from django.db.models import Q
from jobs.models import Job

COMPANY_SIZE_RANGES = {
    "1-10": (1, 10),
    "11-50": (11, 50),
    "51-200": (51, 200),
    "201-500": (201, 500),
    "500+": (501, None),
}

class JobFilter(filters.FilterSet):
    skills = filters.CharFilter(method="filter_skills")
    # the query string from the frontend would contain roles not role (also can be searched by role)
    roles = filters.BaseInFilter(field_name="role", lookup_expr="in")
    # Rename field from underscore to camelCase to match frontend and serializer (so these can't be in Meta)
    minSalary = filters.NumberFilter(field_name="min_salary", lookup_expr="gte")
    maxSalary = filters.NumberFilter(field_name="max_salary", lookup_expr="lte")
    # timeframe = filters.CharFilter(field_name="timeframe", lookup_expr="exact")
    # markets filters via company__market (Job has no market field directly)
    markets = filters.CharFilter(method="filter_markets")
    # companySizes filters via company__team_size ranges (Job has no company_size field)
    companySizes = filters.CharFilter(method="filter_company_sizes")
    workType = filters.CharFilter(field_name="work_type", lookup_expr="exact")
    
    class Meta:
        model = Job
        fields = {
            "level": ["exact", "in"],
            "contract": ["exact", "in"],
            "location": ["icontains"],
            # in can't work for JSONField,
            # "skill": ["in"]
            # "price": ["lt", "gt"],
            # "release_date": ["exact", "year__gt"], 
            "currency": ["exact"],
            # "market": ["exact", "in"],
            "timeframe": ["exact"],
        }

    def filter_skills(self, queryset, name, value):
        skills_list = [s.strip() for s in value.split(",") if s.strip()]
        if not skills_list:
            return queryset
        from django.db import connection
        if connection.vendor == "sqlite":
            for skill in skills_list:
                queryset = queryset.extra(
                    where=["json_extract(skills, '$') LIKE %s"],
                    params=[f'%"{skill}"%'],
                )
        else:
            queryset = queryset.filter(skills__contains=skills_list)
        return queryset

    def filter_markets(self, queryset, name, value):
        """Filter jobs by company market (comma-separated list)."""
        markets = [m.strip().lower() for m in value.split(",") if m.strip()]
        if not markets:
            return queryset
        return queryset.filter(company__market__in=markets)

    def filter_company_sizes(self, queryset, name, value):
        """Filter jobs by company team_size bands (comma-separated, e.g. '1-10,11-50')."""
        bands = [b.strip() for b in value.split(",") if b.strip()]
        if not bands:
            return queryset
        size_q = Q()
        for band in bands:
            r = COMPANY_SIZE_RANGES.get(band)
            if r:
                low, high = r
                if high is not None:
                    size_q |= Q(company__team_size__gte=low, company__team_size__lte=high)
                else:
                    size_q |= Q(company__team_size__gte=low)
        if size_q:
            return queryset.filter(size_q)
        return queryset
    
    