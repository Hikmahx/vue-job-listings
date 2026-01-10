from django.contrib import admin
from accounts.models import User, JobSeekerProfile, FounderProfile

admin.site.register(User)
admin.site.register(JobSeekerProfile)
admin.site.register(FounderProfile)