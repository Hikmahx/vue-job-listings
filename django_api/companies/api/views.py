from rest_framework import generics, permissions, status
from rest_framework.response import Response
from companies.models import Company
from companies.api.serializers import CompanySerializer
from companies.api.permissions import IsCompanyFounder

class GetAllCompaniesAPI(generics.ListAPIView):
    queryset = Company.objects.all().order_by('-created_at')
    serializer_class = CompanySerializer
    
    
class GetCompaniesByFounderAPI(generics.ListAPIView):
    serializer_class = CompanySerializer
    
    def get_queryset(self):
        founder_id = self.kwargs.get('founder_id')
        return Company.objects.filter(founder__id=founder_id).order_by('-created_at')
    
class CreateCompany(generics.CreateAPIView):
    serializer_class = CompanySerializer
    permission_classes = [permissions.IsAuthenticated,]

    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Set the founder from the request user
        serializer.save(founder=request.user)
        
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class UpdateCompany(generics.UpdateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    lookup_field = 'id'
    permission_classes = [
        permissions.IsAuthenticated,
        IsCompanyFounder,
    ]
    
class deleteCompany(generics.DestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    lookup_field = 'id'
    permission_classes = [
        permissions.IsAuthenticated,
        IsCompanyFounder,
    ]