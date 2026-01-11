from django.urls import path
from companies.api.views import (
    GetAllCompaniesAPI,
    GetCompanyBySlugAPI,
    GetCompanyPeopleAPI,
    GetCompaniesByFounderAPI,
    CreateCompanyAPI,
    UpdateCompanyAPI,
    DeleteCompanyAPI,
    AddFounderAPI,
    RemoveFounderAPI,
    AddEmployeeAPI,
    RemoveEmployeeAPI,
)

urlpatterns = [
    path('', GetAllCompaniesAPI.as_view(), name='get-all-companies'),
    path('create/', CreateCompanyAPI.as_view(), name='create-company'),
    path('founder/<int:founder_id>/', GetCompaniesByFounderAPI.as_view(), name='get-companies-by-founder'),
    
    # Company-specific routes (using slug)
    path('<slug:slug>/', GetCompanyBySlugAPI.as_view(), name='get-company'),
    path('<slug:slug>/people/', GetCompanyPeopleAPI.as_view(), name='get-company-people'),
    path('<slug:slug>/update/', UpdateCompanyAPI.as_view(), name='update-company'),
    path('<slug:slug>/delete/', DeleteCompanyAPI.as_view(), name='delete-company'),
    
    # Founder management
    path('<slug:slug>/people/founders/add/', AddFounderAPI.as_view(), name='add-founder'),
    path('<slug:slug>/people/founders/<int:founder_id>/remove/', RemoveFounderAPI.as_view(), name='remove-founder'),
    
    # Employee management
    path('<slug:slug>/people/team/add/', AddEmployeeAPI.as_view(), name='add-employee'),
    path('<slug:slug>/people/team/<int:employee_id>/remove/', RemoveEmployeeAPI.as_view(), name='remove-employee'),
]