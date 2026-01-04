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

class GetAllJobsAPI(generics.ListAPIView):
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
    """AI search with semantic vector search + filters"""
    serializer_class = JobSerializer
    
    def post(self, request, *args, **kwargs):
        user_query = request.data.get('query', '').strip()
        
        if not user_query:
            return Response({"error": "Query required"}, status=400)
        
        # Extract filters
        filters = extract_filters_from_query(user_query)
        
        # Try semantic search first
        try:
            from jobs.api.vector_search import search_similar_jobs
            semantic_ids = search_similar_jobs(user_query, limit=50)
            queryset = Job.objects.filter(id__in=semantic_ids).select_related('details')
        except Exception as e:
            print(f"Semantic search failed, using filters only: {e}")
            queryset = Job.objects.select_related('details').all()
        
        # Apply filters
        if filters.get('location'):
            queryset = queryset.filter(location=filters['location'])
        if filters.get('level'):
            queryset = queryset.filter(level=filters['level'])
        if filters.get('roles'):
            queryset = queryset.filter(role__in=filters['roles'])
        if filters.get('skills'):
            from django.db import connection
            for skill in filters['skills']:
                if connection.vendor == 'sqlite':
                    queryset = queryset.extra(
                        where=["json_extract(skills, '$') LIKE %s"],
                        params=[f'%"{skill}"%']
                    )
                else:
                    queryset = queryset.filter(skills__contains=[skill])
        if filters.get('markets'):
            queryset = queryset.filter(market__in=filters['markets'])
        if filters.get('companySizes'):
            queryset = queryset.filter(company_size__in=filters['companySizes'])
        if filters.get('workType'):
            queryset = queryset.filter(work_type=filters['workType'])
        
        # Contract - check if exists before filtering
        if filters.get('contract'):
            if Job.objects.filter(contract=filters['contract']).exists():
                queryset = queryset.filter(contract=filters['contract'])
            else:
                print(f"No jobs with contract '{filters['contract']}', skipping filter")
        
        if filters.get('currency'):
            queryset = queryset.filter(currency=filters['currency'])
        if filters.get('minSalary') is not None:
            queryset = queryset.filter(min_salary__gte=filters['minSalary'])
        if filters.get('maxSalary') is not None:
            queryset = queryset.filter(max_salary__lte=filters['maxSalary'])
        
        serializer = self.get_serializer(queryset, many=True)
        
        return Response({
            'jobs': serializer.data,
            'extracted_filters': filters,
            'query': user_query,
            'count': queryset.count()
        })


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