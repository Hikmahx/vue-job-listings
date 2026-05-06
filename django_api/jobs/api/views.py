from datetime import date
from rest_framework import generics, permissions, views
from rest_framework.response import Response
from django.db.models import Q
from django.db import connection
from jobs.models import Job
from jobs.api.serializers import JobSerializer
from django_filters import rest_framework as filters
from rest_framework.filters import SearchFilter, OrderingFilter
from jobs.api.filters import JobFilter, COMPANY_SIZE_RANGES
from jobs.api.pagination import JobPagination
from jobs.api.ai_search import extract_filters_from_query
from jobs.api.permissions import CanManageJob
from companies.models import CompanyMember
from rest_framework.exceptions import PermissionDenied


class GetAllJobsAPI(generics.ListAPIView):
    # queryset = Job.objects.all().order_by('-posted_at')
    serializer_class = JobSerializer
    filter_backends = (filters.DjangoFilterBackend, SearchFilter, OrderingFilter)
    pagination_class = JobPagination
    # filterset_fields = ('level', 'contract', 'location', 'role', 'company')
    filterset_class = JobFilter
    search_fields = ['company__name', 'position', 'role', 'level', 'skills', 'location']
    
    def get_queryset(self):
        queryset = Job.objects.select_related('details', 'company').all()
        ordering = '-posted_at'
        sort_by_company = self.request.query_params.get('sortByCompany', '').lower()
        if sort_by_company == 'true':
            ordering = 'company__name'
            
        return queryset.order_by(ordering)


class GetJobWithDetails(generics.RetrieveAPIView):
    queryset = Job.objects.select_related('details', 'company')
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

        job = serializer.save(company=company)
        try:
            from jobs.api.vector_search import index_job
            index_job(job)
        except Exception as e:
            print(f'Failed to index new job {job.id}: {e}')


class UpdateJobAPI(generics.UpdateAPIView):
    queryset = Job.objects.select_related('details', 'company')
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageJob]
    lookup_field = 'id'

    def perform_update(self, serializer):
        job = serializer.save()
        try:
            from jobs.api.vector_search import index_job
            index_job(job)
        except Exception as e:
            print(f'Failed to re-index updated job {job.id}: {e}')


class DeleteJobAPI(generics.DestroyAPIView):
    queryset = Job.objects.select_related('company')
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticated, CanManageJob]
    lookup_field = 'id'

    def perform_destroy(self, instance):
        job_id = str(instance.id)
        instance.delete()
        try:
            from jobs.api.vector_search import remove_job_from_index
            remove_job_from_index(job_id)
        except Exception as e:
            print(f'Failed to remove job {job_id} from index: {e}')


def apply_ai_only_filters(queryset, ai_only: dict):
    """Apply AI-only criteria that have no equivalent in JobFilter/FilterModal."""
    if ai_only.get('companyFoundedAfter') is not None:
        queryset = queryset.filter(company__founded_year__gte=ai_only['companyFoundedAfter'])
    if ai_only.get('companyFoundedBefore') is not None:
        queryset = queryset.filter(company__founded_year__lte=ai_only['companyFoundedBefore'])
    if ai_only.get('founderCeoGender'):
        queryset = queryset.filter(
            company__members__role='founder',
            company__members__user__gender=ai_only['founderCeoGender'],
        ).distinct()
    if ai_only.get('employeeMinAge') is not None:
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
    if ai_only.get('targetApplicantGender'):
        queryset = queryset.filter(
            company__members__user__gender=ai_only['targetApplicantGender'],
        ).distinct()
    return queryset


class ParseQueryAPI(views.APIView):
    """
    POST /api/jobs/parse-query/
    Mirrors Express /api/jobs/parse-query — returns filters only, no jobs.
    Client applies them to FilterStore then calls GET /api/jobs/ normally.
    """
    def post(self, request, *args, **kwargs):
        user_query = (request.data.get('query') or '').strip()
        if not user_query:
            return Response({'message': 'query is required'}, status=400)

        result = extract_filters_from_query(user_query)
        return Response({
            'filters': result['extracted_filters'],
            'ai_filters': result['ai_only'],
            'ai_applied_criteria': result['ai_applied_criteria'],
        })


class AISearchAPI(views.APIView):
    """
    POST /api/jobs/ai-search/
    Full pipeline: RAG → Groq → vector search → JobFilter → AI-only filters → jobs.
    Uses JobFilter directly (via request.GET) to avoid duplicating filter logic.
    """
    def post(self, request, *args, **kwargs):
        user_query = (request.data.get('query') or '').strip()
        if not user_query:
            return Response({"error": "Query required"}, status=400)

        result = extract_filters_from_query(user_query)
        extracted_filters = result['extracted_filters']
        ai_only = result['ai_only']
        ai_applied_criteria = result['ai_applied_criteria']

        # Phase 1: semantic/vector narrowing
        try:
            from jobs.api.vector_search import search_similar_jobs
            semantic_ids = search_similar_jobs(user_query, limit=50)
            queryset = Job.objects.filter(id__in=semantic_ids).select_related('details', 'company')
        except Exception as e:
            print(f'[AI-SEARCH] Vector search failed, falling back: {e}')
            queryset = Job.objects.select_related('details', 'company').all()

        # Phase 2: apply standard FilterModal filters via JobFilter
        # Build a mutable query dict from extracted_filters so JobFilter can process them
        filter_data = {}
        for key, value in extracted_filters.items():
            if value is None or value == '':
                continue
            if isinstance(value, list):
                filter_data[key] = ','.join(str(v) for v in value) if value else ''
            else:
                filter_data[key] = value

        from django.http import QueryDict
        qd = QueryDict(mutable=True)
        for k, v in filter_data.items():
            qd[k] = str(v)
        filterset = JobFilter(data=qd, queryset=queryset)
        if filterset.is_valid():
            queryset = filterset.qs

        # Phase 3: AI-only criteria (not in JobFilter)
        queryset = apply_ai_only_filters(queryset, ai_only)

        serializer = JobSerializer(queryset, many=True, context={'request': request})
        return Response({
            'jobs': serializer.data,
            'filters': extracted_filters,
            'ai_filters': ai_only,
            'ai_applied_criteria': ai_applied_criteria,
            'query': user_query,
            'count': queryset.count(),
        })
