from django.db import models
from django.utils import timezone
from shortuuidfield import ShortUUIDField

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
    currency = models.CharField(max_length=50, choices=CURRENCY_CHOICES, default='')
    min_salary = models.IntegerField(default=0)
    max_salary = models.IntegerField(default=0)
    market = models.CharField(max_length=50, choices=MARKET_CHOICES, default='')
    company_size = models.CharField(max_length=50, choices=COMPANYSIZE_CHOICES, default='')
    work_type = models.CharField(max_length=50, choices=WORKTYPE_CHOICES, default='')
    skills = models.JSONField(default=list)
    
    def __str__(self):
        return f"{self.company} - {self.position}"