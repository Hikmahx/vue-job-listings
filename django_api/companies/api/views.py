from rest_framework import generics, permissions, status
from rest_framework.response import Response
from companies.models import Company
from companies.api.serializers import CompanySerializer
from companies.api.permissions import IsCompanyFounder, IsFounder

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
    permission_classes = [permissions.IsAuthenticated, IsFounder]

    def perform_create(self, serializer):
        serializer.save(founder=self.request.user)


class UpdateCompany(generics.UpdateAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    lookup_field = 'id'
    permission_classes = [
        permissions.IsAuthenticated,
        IsCompanyFounder,
    ]
    
class DeleteCompany(generics.DestroyAPIView):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    lookup_field = 'id'
    permission_classes = [
        permissions.IsAuthenticated,
        IsCompanyFounder,
    ]