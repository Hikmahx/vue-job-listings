from django.db import models
from django.utils import timezone
import uuid

class Job(models.Model):
    LEVEL_CHOICES = [
        ('junior', 'Junior'),
        ('midweight', 'Midweight'),
        ('senior', 'Senior'),
    ]
    CONTRACT_CHOICES = [
        ('contract', 'Contract'),
        ('full-time', 'Full Time'),
        ('part-time', 'Part Time'),
        ('internship', 'Internship'),
    ]
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4().hex, editable=False)
    company = models.CharField(max_length=50)
    logo = models.URLField()
    featured = models.BooleanField(default=False)
    position = models.CharField(max_length=100)
    role = models.CharField(max_length=50)
    level = models.CharField(max_length=50, choices=LEVEL_CHOICES)
    posted_at = models.DateTimeField(default=timezone.now)
    contract = models.CharField(max_length=50, choices=CONTRACT_CHOICES)
    location = models.CharField(max_length=100)
    skills = models.JSONField(default=list)
    
    def __str__(self):
        return f"{self.company} - {self.position}"