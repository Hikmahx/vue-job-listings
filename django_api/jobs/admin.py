from django.contrib import admin

from jobs.models import Job, JobDetails

admin.site.register(Job)
admin.site.register(JobDetails)