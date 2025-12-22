from django.urls import path
from jobs.api.views import (GetAllJobsAPI, GetJobWithDetails)


urlpatterns = [
    path("", GetAllJobsAPI.as_view(), name='get-all-jobs'), 
    path("<str:id>/", GetJobWithDetails.as_view(), name='get-job-with-details'), 
]