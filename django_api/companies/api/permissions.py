from rest_framework import permissions

class IsCompanyFounder(permissions.BasePermission):
    """
    Check if the founder is the one who created the company
    """

    def has_permission(self, request, view):
        company = view.get_object()
        if company.founder == request.user:
            return True
        else:
              self.message = "You are not one of the founders of this company "
              return False
