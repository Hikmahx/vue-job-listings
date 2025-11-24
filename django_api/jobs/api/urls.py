from django.urls import path
from jobs.api.views import (GetAllJobsAPI)


urlpatterns = [
    path("", GetAllJobsAPI.as_view(), name='get-all-jobs')   
]