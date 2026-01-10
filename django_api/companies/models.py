from django.db import models
from django.conf import settings

class Company(models.Model):
    INDUSTRY_CHOICES = [
        ('saas', 'SaaS'),
        ('fintech', 'FinTech'),
        ('healthtech', 'HealthTech'),
        ('ecommerce', 'E-commerce'),
        ('education', 'Education'),
        ('software', 'Software'),
        ('marketplace', 'Marketplace'),
        ('ai_ml', 'AI/ML'),
        ('devtools', 'DevTools'),
        ('gaming', 'Gaming'),
        ('social_media', 'Social Media'),
        ('cryptocurrency', 'Cryptocurrency'),
        ('security', 'Security'),
        ('climate_tech', 'Climate Tech'),
        ('real_estate', 'Real Estate'),
        ('travel', 'Travel'),
        ('food_beverage', 'Food & Beverage'),
        ('others', 'Others'),
    ]
    
    SIZE_CHOICES = [
        ('1-10', '1-10'),
        ('11-50', '11-50'),
        ('51-200', '51-200'),
        ('201-500', '201-500'),
        ('500+', '500+'),
    ]
    
    name = models.CharField(max_length=100, unique=True)
    logo = models.URLField(blank=True)
    description = models.TextField()
    industry = models.CharField(max_length=50, choices=INDUSTRY_CHOICES)
    team_size = models.PositiveIntegerField(blank=True, null=True)
    founded_year = models.PositiveIntegerField(blank=True, null=True)
    website = models.URLField(blank=True)
    location = models.CharField(max_length=100)

    # Founder (the person who created the company)
    founder = models.ForeignKey('accounts.User', on_delete=models.SET_NULL, null=True, related_name='founded_companies')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = 'Companies'

    def __str__(self):
        return self.name