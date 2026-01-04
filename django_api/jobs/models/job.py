from django.db import models
from django.utils import timezone
from shortuuidfield import ShortUUIDField
from .job_details import JobDetails
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
import pycountry
# from babel.numbers import get_currency_symbol

# CURRENCY_CHOICES = []

# for currency in pycountry.currencies:
#     try:
#         symbol = get_currency_symbol(currency.alpha_3)
#         CURRENCY_CHOICES.append((symbol, currency.alpha_3))
#     except:
#         pass  # some currencies may not have symbols

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
    
    WORKTYPE_CHOICES = [
        ("remote", "remote"),
        ("hybrid", "hybrid"),
        ("onsite", "onsite"),
    ]

    TIMEFRAME_CHOICES = [
        ("hour", "Hour"),
        ("day", "Day"),
        ("week", "Week"),
        ("month", "Month"),
        ("year", "Year"),
    ]
    
    CURRENCY_DATA = [
    ('$', 'USD'),
    ('£', 'GBP'),
    ('¥', 'CNY'),
    ('৳', 'BDT'),
    ('฿', 'THB'),
    ('₡', 'CRC'),
    ('₦', 'NGN'),
    ('₩', 'KRW'),
    ('₪', 'ILS'),
    ('₫', 'VND'),
    ('€', 'EUR'),
    ('₱', 'PHP'),
    ('₲', 'PYG'),
    ('₴', 'UAH'),
    ('₹', 'INR'),
    ('₺', 'TRY'),
    ('₽', 'RUB'),
    ('₾', 'GEL'),
    ('₿', 'BTC'),
    ('Ł', 'LTC'),
    ('ɱ', 'XMR'),
    ('zł', 'PLN'),
    ('Ξ', 'ETH'),        
    ]
    
    CURRENCY_CHOICES = sorted(
        [(symbol, f"{code} ({symbol})") for symbol, code in CURRENCY_DATA],
        key=lambda x: x[1].split(" ")[0]  
    )
    
    MARKET_CHOICES = [
        ("saas", "SaaS"),
        ("fintech", "FinTech"),
        ("healthtech", "HealthTech"),
        ("ecommerce", "E-commerce"),
        ("education", "Education"),
        ("software", "Software"),
        ("marketplace", "Marketplace"),
        ("ai_ml", "AI/ML"),
        ("devtools", "DevTools"),
        ("gaming", "Gaming"),
        ("social_media", "Social Media"),
        ("cryptocurrency", "Cryptocurrency"),
        ("security", "Security"),
        ("climate_tech", "Climate Tech"),
        ("real_estate", "Real Estate"),
        ("travel", "Travel"),
        ("food_beverage", "Food & Beverage"),
        ("others", "Others"),
    ]
    
    COMPANYSIZE_CHOICES = [
        ("1-10", "1-10"),
        ("11-50", "11-50"),
        ("51-200", "51-200"),
        ("201-500", "201-500"),
        ("500+", "500+"),
    ]
    
    LOCATION_CHOICES = [(country.alpha_2, country.name) for country in pycountry.countries]

    
    id = ShortUUIDField(primary_key=True)
    company = models.CharField(max_length=50)
    logo = models.URLField()
    featured = models.BooleanField(default=False)
    position = models.CharField(max_length=100)
    role = models.CharField(max_length=50)
    level = models.CharField(max_length=50, choices=LEVEL_CHOICES)
    posted_at = models.DateTimeField(default=timezone.now)
    contract = models.CharField(max_length=50, choices=CONTRACT_CHOICES)
    # only countries or worldwide is allowed in location (remote can cause conflict with work_type)
    # also bcos $ currency is universal and location helps narrow down the pool
    location = models.CharField(max_length=100, choices=LOCATION_CHOICES)
    # default is added insteadd of null to make sure that the optional fields still show in the json response, even as an empty value
    currency = models.CharField(max_length=50, choices=CURRENCY_CHOICES, blank=True, default='')
    min_salary = models.IntegerField(default=0)
    max_salary = models.IntegerField(default=0)
    timeframe = models.CharField(
        max_length=16, choices=TIMEFRAME_CHOICES, blank=True, default='year'
    )
    market = models.CharField(max_length=50, choices=MARKET_CHOICES, default='')
    company_size = models.CharField(max_length=50, choices=COMPANYSIZE_CHOICES, default='')
    work_type = models.CharField(max_length=50, choices=WORKTYPE_CHOICES, default='')
    skills = models.JSONField(default=list)
    details = models.OneToOneField(
        JobDetails, 
        on_delete=models.CASCADE, 
        related_name='job',
        null=True,
        blank=True
    )
    
    def __str__(self):
        return f"{self.company} - {self.position}"
    

@receiver(post_save, sender='jobs.Job')
def auto_index_job(sender, instance, **kwargs):
    """Auto-index when job is created/updated"""
    try:
        from jobs.api.vector_search import index_job
        index_job(instance)
    except Exception as e:
        print(f"Vector indexing failed: {e}")

@receiver(post_delete, sender='jobs.Job')
def delete_job_vector(sender, instance, **kwargs):
    """Remove vector when job deleted"""
    try:
        from jobs.api.vector_search import get_vector_db
        conn = get_vector_db()
        conn.execute("DELETE FROM job_vectors WHERE job_id = ?", (str(instance.id),))
        conn.commit()
        conn.close()
    except:
        pass