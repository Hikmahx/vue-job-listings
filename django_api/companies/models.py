from django.db import models
from django.conf import settings
from django.utils.text import slugify

class Company(models.Model):
    MARKET_CHOICES = [
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
    
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    logo = models.URLField(blank=True)
    description = models.TextField()
    market = models.CharField(max_length=50, choices=MARKET_CHOICES)
    team_size = models.PositiveIntegerField(blank=True, null=True)
    founded_year = models.PositiveIntegerField(blank=True, null=True)
    website = models.URLField(blank=True)
    location = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = "companies"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    @property
    def founders(self):
        return self.members.filter(role="founder")

    @property
    def team(self):
        # return self.members.all()
        return self.members.filter(role="employee")

    def __str__(self):
        return self.name


class CompanyMember(models.Model):
    ROLE_CHOICES = [
        ("founder", "Founder"),
        ("employee", "Employee"),
    ]

    PERMISSION_CHOICES = [
        ("owner", "Owner"),
        ("admin", "Admin"),
        ("member", "Member"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="company_memberships"
    )

    company = models.ForeignKey(
        Company,
        on_delete=models.CASCADE,
        related_name="members"
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    permission = models.CharField(max_length=20, choices=PERMISSION_CHOICES)
    title = models.CharField(max_length=100, blank=True)
    joined_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "company")
        db_table = "company_members"

    def __str__(self):
        return f"{self.user.email} → {self.company.name} ({self.role})"
