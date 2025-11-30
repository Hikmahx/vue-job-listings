from rest_framework import generics, status
from rest_framework.response import Response
from jobs.models import Job
from jobs.api.serializers import JobSerializer
from django_filters import rest_framework as filters
from rest_framework.filters import SearchFilter, OrderingFilter
from jobs.api.filters import JobFilter

class GetAllJobsAPI (generics.ListAPIView):
    # queryset = Job.objects.all().order_by('-posted_at')
    serializer_class = JobSerializer
    filter_backends = (filters.DjangoFilterBackend, SearchFilter, OrderingFilter)
    # filterset_fields = ('level', 'contract', 'location', 'role', 'company')
    filterset_class = JobFilter
    search_fields = ['company', 'position', 'role', 'level', 'skills', 'location']
    
    def get_queryset(self):
        queryset = Job.objects.all() 
        ordering = '-posted_at'
        sort_by_company = self.request.query_params.get('sortByCompany', '').lower()
        if sort_by_company == 'true':
            ordering = 'company'
            
        return queryset.order_by(ordering)
    

