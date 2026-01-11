from rest_framework import permissions

class IsCompanyFounder(permissions.BasePermission):
    """
    Founder with any level of permission
    """
    def has_object_permission(self, request, view, obj):
        return obj.members.filter(
            user=request.user,
            role="founder"
        ).exists()


class IsCompanyAdmin(permissions.BasePermission):
    """
    Founder with admin or owner permission
    """
    def has_object_permission(self, request, view, obj):
        return obj.members.filter(
            user=request.user,
            role="founder",
            permission__in=["owner", "admin"]
        ).exists()


class IsCompanyOwner(permissions.BasePermission):
    """
    Only the primary founder (owner)
    """
    def has_object_permission(self, request, view, obj):
        return obj.members.filter(
            user=request.user,
            role="founder",
            permission="owner"
        ).exists()
