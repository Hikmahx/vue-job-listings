from django.contrib import admin
from accounts.models import User, JobSeekerProfile, TeamMemberProfile

admin.site.register(User)
admin.site.register(JobSeekerProfile)
admin.site.register(TeamMemberProfile)