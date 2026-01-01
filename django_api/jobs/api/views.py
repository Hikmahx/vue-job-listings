from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q
from jobs.models import Job
from jobs.api.serializers import JobSerializer
from django_filters import rest_framework as filters
from rest_framework.filters import SearchFilter, OrderingFilter
from jobs.api.filters import JobFilter
from jobs.api.pagination import JobPagination
from jobs.api.ai_search import extract_filters_from_query

class GetAllJobsAPI (generics.ListAPIView):
    # queryset = Job.objects.all().order_by('-posted_at')
    serializer_class = JobSerializer
    filter_backends = (filters.DjangoFilterBackend, SearchFilter, OrderingFilter)
    pagination_class = JobPagination
    # filterset_fields = ('level', 'contract', 'location', 'role', 'company')
    filterset_class = JobFilter
    search_fields = ['company', 'position', 'role', 'level', 'skills', 'location']
    
    def get_queryset(self):
        queryset = Job.objects.select_related('details').all()
        ordering = '-posted_at'
        sort_by_company = self.request.query_params.get('sortByCompany', '').lower()
        if sort_by_company == 'true':
            ordering = 'company'
            
        return queryset.order_by(ordering)
    

class AISearchAPI(generics.ListAPIView):
    """AI-powered natural language job search"""
    serializer_class = JobSerializer
    
    def post(self, request, *args, **kwargs):
        user_query = request.data.get('query', '').strip()
        
        if not user_query:
            return Response(
                {"error": "Query is required"}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        extracted_filters = extract_filters_from_query(user_query)
        queryset = self.get_filtered_queryset(extracted_filters)
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'jobs': serializer.data,
            'extracted_filters': extracted_filters,
            'query': user_query,
            'count': queryset.count()
        })
    
    def get_filtered_queryset(self, filters):
        """Apply extracted filters to queryset"""
        queryset = Job.objects.select_related('details').all()
        
        # General search
        if filters.get('search'):
            queryset = queryset.filter(
                Q(position__icontains=filters['search']) |
                Q(company__icontains=filters['search']) |
                Q(role__icontains=filters['search'])
            )
        
        # Exact matches
        if filters.get('location'):
            queryset = queryset.filter(location=filters['location'])
        if filters.get('level'):
            queryset = queryset.filter(level=filters['level'])
        if filters.get('workType'):
            queryset = queryset.filter(work_type=filters['workType'])
        if filters.get('contract'):
            queryset = queryset.filter(contract=filters['contract'])
        if filters.get('currency'):
            queryset = queryset.filter(currency=filters['currency'])
        if filters.get('timeframe'):
            queryset = queryset.filter(timeframe=filters['timeframe'])
        
        # Array filters
        if filters.get('roles'):
            queryset = queryset.filter(role__in=filters['roles'])
        if filters.get('skills'):
            queryset = queryset.filter(skills__contains=filters['skills'])
        if filters.get('markets'):
            queryset = queryset.filter(market__in=filters['markets'])
        if filters.get('companySizes'):
            queryset = queryset.filter(company_size__in=filters['companySizes'])
        
        # Salary range
        if filters.get('minSalary') is not None:
            queryset = queryset.filter(min_salary__gte=filters['minSalary'])
        if filters.get('maxSalary') is not None:
            queryset = queryset.filter(max_salary__lte=filters['maxSalary'])
        
        return queryset.order_by('-posted_at')
class GetJobWithDetails(generics.RetrieveAPIView):
    queryset = Job.objects.select_related('details')
    serializer_class = JobSerializer
    lookup_field = 'id'

class CreateJobAPI(generics.CreateAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer

class UpdateJobAPI(generics.UpdateAPIView):
    queryset = Job.objects.select_related('details')
    serializer_class = JobSerializer
    lookup_field = 'id'

class DeleteJobAPI(generics.DestroyAPIView):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    lookup_field = 'id'