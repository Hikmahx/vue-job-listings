from rest_framework.permissions import BasePermission
from companies.models import CompanyMember


class CanManageJob(BasePermission):
    """
    User must be a member of the company that owns the job
    AND have permission = owner or admin
    """

    def has_object_permission(self, request, view, obj):
        user = request.user
        company = obj.company

        try:
            membership = CompanyMember.objects.get(user=user, company=company)
        except CompanyMember.DoesNotExist:
            return False

        return membership.permission in ["owner", "admin"]
