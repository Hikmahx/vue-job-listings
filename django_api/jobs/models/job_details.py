from django.db import models

class JobDetails(models.Model):
    job = models.OneToOneField(
        "jobs.Job",
        on_delete=models.CASCADE,
        related_name="details"
    )
    description = models.TextField()
    requirements = models.JSONField(default=dict)
    responsibilities = models.JSONField(default=dict)
    external_apply = models.BooleanField(default=False)
    apply = models.URLField(blank=True, null=True)
    experience_required = models.CharField(max_length=100, blank=True, null=True)
    
    def __str__(self):
        return f"Details for {self.job.position} at {self.job.company}"
