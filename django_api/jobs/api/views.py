from datetime import date
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from django.db import connection
from jobs.models import Job
from jobs.api.serializers import JobSerializer
from django_filters import rest_framework as filters
from rest_framework.filters import SearchFilter, OrderingFilter
from jobs.api.filters import JobFilter
from jobs.api.pagination import JobPagination
from jobs.api.ai_search import extract_filters_from_query
from jobs.api.permissions import CanManageJob
from companies.models import CompanyMember
from rest_framework.exceptions import PermissionDenied

# Map FilterModal company size bands to (min, max) for company.team_size (integer)
COMPANY_SIZE_RANGES = {
    "1-10": (1, 10),
    "11-50": (11, 50),
    "51-200": (51, 200),
    "201-500": (201, 500),
    "500+": (501, None),
}


class GetAllJobsAPI(generics.ListAPIView):
    # queryset = Job.objects.all().order_by('-posted_at')
    serializer_class = JobSerializer
    filter_backends = (filters.DjangoFilterBackend, SearchFilter, OrderingFilter)
    pagination_class = JobPagination
    # filterset_fields = ('level', 'contract', 'location', 'role', 'company')
    filterset_class = JobFilter
    search_fields = ['company__name', 'position', 'role', 'level', 'skills', 'location']
    
    def get_queryset(self):
        queryset = Job.objects.select_related('details').all()
        ordering = '-posted_at'
        sort_by_company = self.request.query_params.get('sortByCompany', '').lower()
        if sort_by_company == 'true':
            ordering = 'company__name'
            
        return queryset.order_by(ordering)


class AISearchAPI(generics.ListAPIView):
    """AI search with semantic vector search + FilterModal-aligned filters + AI-only criteria (company/founder/employee)."""
    serializer_class = JobSerializer
    
    def post(self, request, *args, **kwargs):
        user_query = request.data.get('query', '').strip()
        
        if not user_query:
            return Response({"error": "Query required"}, status=400)
        
        # Extract FilterModal-shaped filters + AI-only criteria
        result = extract_filters_from_query(user_query)
        filters = result['extracted_filters']
        ai_only = result['ai_only']
        ai_applied_criteria = result['ai_applied_criteria']
        
        # Try semantic search first
        try:
            from jobs.api.vector_search import search_similar_jobs
            semantic_ids = search_similar_jobs(user_query, limit=50)
            queryset = Job.objects.filter(id__in=semantic_ids).select_related('details', 'company')
        except Exception as e:
            print(f'Semantic search failed, using filters only: {e}')
            queryset = Job.objects.select_related('details', 'company').all()
        
        # —— FilterModal-aligned filters ——
        if filters.get('location'):
            queryset = queryset.filter(location=filters['location'])
        if filters.get('level'):
            queryset = queryset.filter(level=filters['level'])
        if filters.get('roles'):
            queryset = queryset.filter(role__in=filters['roles'])
        if filters.get('skills'):
            for skill in filters['skills']:
                if connection.vendor == 'sqlite':
                    queryset = queryset.extra(
                        where=["json_extract(skills, '$') LIKE %s"],
                        params=[f'%"{skill}"%']
                    )
                else:
                    queryset = queryset.filter(skills__contains=[skill])
        if filters.get('markets'):
            markets = [m.lower().strip() if isinstance(m, str) else m for m in filters['markets']]
            queryset = queryset.filter(company__market__in=markets)
        if filters.get('companySizes'):
            size_q = Q()
            for band in filters['companySizes']:
                r = COMPANY_SIZE_RANGES.get(band)
                if r:
                    low, high = r
                    if high is not None:
                        size_q |= Q(company__team_size__gte=low, company__team_size__lte=high)
                    else:
                        size_q |= Q(company__team_size__gte=low)
            if size_q:
                queryset = queryset.filter(size_q)
        if filters.get('workType'):
            queryset = queryset.filter(work_type=filters['workType'])
        if filters.get('contract'):
            contracts = filters['contract'] if isinstance(filters['contract'], list) else [filters['contract']]
            if contracts:
                queryset = queryset.filter(contract__in=contracts)
        if filters.get('currency'):
            queryset = queryset.filter(currency=filters['currency'])
        if filters.get('minSalary') is not None:
            queryset = queryset.filter(min_salary__gte=filters['minSalary'])
        if filters.get('maxSalary') is not None:
            queryset = queryset.filter(max_salary__lte=filters['maxSalary'])
        if filters.get('timeframe'):
            queryset = queryset.filter(timeframe=filters['timeframe'])

        # —— AI-only criteria (company / founder / employee) ——
        if ai_only.get('companyFoundedAfter') is not None:
            queryset = queryset.filter(company__founded_year__gte=ai_only['companyFoundedAfter'])
        if ai_only.get('companyFoundedBefore') is not None:
            queryset = queryset.filter(company__founded_year__lte=ai_only['companyFoundedBefore'])
        if ai_only.get('founderCeoGender'):
            # Jobs at companies that have at least one founder with this gender
            queryset = queryset.filter(
                company__members__role='founder',
                company__members__user__gender=ai_only['founderCeoGender'],
            ).distinct()
        if ai_only.get('employeeMinAge') is not None:
            # Companies with at least one employee whose age >= employeeMinAge (birth year <= today.year - age)
            cutoff_year = date.today().year - ai_only['employeeMinAge']
            queryset = queryset.filter(
                company__members__role='employee',
                company__members__user__date_of_birth__year__lte=cutoff_year,
            ).distinct()
        if ai_only.get('employeeMinExperienceYears') is not None:
            queryset = queryset.filter(
                company__members__role='employee',
                company__members__user__experience_years__gte=ai_only['employeeMinExperienceYears'],
            ).distinct()

        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'jobs': serializer.data,
            'extracted_filters': filters,
            'ai_only': ai_only,
            'ai_applied_criteria': ai_applied_criteria,
            'query': user_query,
            'count': queryset.count()
        })


class GetJobWithDetails(generics.RetrieveAPIView):
    queryset = Job.objects.select_related('details')
    serializer_class = JobSerializer
    lookup_field = 'id'


class CreateJobAPI(generics.CreateAPIView):
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        company = user.team_member_profile.active_company

        try:
            membership = CompanyMember.objects.get(user=user, company=company)
        except CompanyMember.DoesNotExist:
            raise PermissionDenied("You are not a member of this company")

        if membership.permission not in ["owner", "admin"]:
            raise PermissionDenied("You do not have permission to post jobs")

        serializer.save(company=company)


class UpdateJobAPI(generics.UpdateAPIView):
    queryset = Job.objects.select_related('details', 'company')
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageJob]
    lookup_field = 'id'


class DeleteJobAPI(generics.DestroyAPIView):
    queryset = Job.objects.select_related('company')
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageJob]
    lookup_field = 'id'
