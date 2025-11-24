from rest_framework import generics, status
from rest_framework.response import Response
from jobs.models import Job
from jobs.api.serializers import JobSerializer

class GetAllJobsAPI (generics.ListAPIView):
    queryset = Job.objects.all().order_by('-posted_at')
    serializer_class = JobSerializer