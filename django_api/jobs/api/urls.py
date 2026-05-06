from django.urls import path
from .views import (
    GetAllJobsAPI,
    GetJobWithDetails,
    CreateJobAPI,
    UpdateJobAPI,
    DeleteJobAPI,
    AISearchAPI,
    ParseQueryAPI,
)

urlpatterns = [
    # RAG endpoints — must come before the <str:id> catch-all
    path('parse-query/', ParseQueryAPI.as_view(), name='parse-query'),  # mirrors Express POST /api/jobs/parse-query
    path('ai-search/', AISearchAPI.as_view(), name='ai-search'),

    # Standard CRUD
    path('create/', CreateJobAPI.as_view(), name='create-job'),
    path('', GetAllJobsAPI.as_view(), name='get-all-jobs'),
    path('<str:id>/', GetJobWithDetails.as_view(), name='get-job-with-details'),
    path('update/<str:id>/', UpdateJobAPI.as_view(), name='update-job'),
    path('delete/<str:id>/', DeleteJobAPI.as_view(), name='delete-job'),
]
