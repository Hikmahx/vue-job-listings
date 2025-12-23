from rest_framework import generics
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
        queryset = Job.objects.select_related('details').all()
        ordering = '-posted_at'
        sort_by_company = self.request.query_params.get('sortByCompany', '').lower()
        if sort_by_company == 'true':
            ordering = 'company'
            
        return queryset.order_by(ordering)
    
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