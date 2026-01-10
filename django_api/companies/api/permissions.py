from rest_framework import permissions

class IsCompanyFounder(permissions.BasePermission):
    """
    Check if the founder is the one who created the company
    """

    def has_object_permission(self, request, view, obj):
        # has_object_permission instead of has_permission
        if obj.founder == request.user:
            return True
        else:
            self.message = "You are not the founder of this company"
            return False

class IsFounder(permissions.BasePermission):
    """
    Check if the user is a founder
    """

    def has_permission(self, request, view):
        if request.user.role == 'founder':
            return True
        else:
              self.message = "You are not one of the founders of this company "
              return False
