from django.db import models

class JobDetails(models.Model):
    description = models.TextField()
    requirements = models.JSONField(default=lambda: {"content": "", "items": []})
    responsibilities = models.JSONField(default=lambda: {"content": "", "items": []})
    external_apply = models.BooleanField(default=False)
    apply = models.URLField(blank=True, null=True)
    experience_required = models.CharField(max_length=100, blank=True, null=True)
    founded_year = models.PositiveIntegerField(blank=True, null=True)
    website = models.URLField(blank=True, null=True)
    
    def __str__(self):
        try:
            return f"Details for {self.job.position} at {self.job.company}"
        except:
            return "Job Details (no job linked)"