from django.contrib import admin
from companies.models import Company, CompanyFounder, CompanyEmployee

admin.site.register(Company)
admin.site.register(CompanyFounder)
admin.site.register(CompanyEmployee)