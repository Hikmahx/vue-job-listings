from django.db import models
from django.conf import settings


class ColdEmailEntry(models.Model):
    STATUS_CHOICES = [
        ('opened', 'Opened'),
        ('replied', 'Replied'),
        ('ignored', 'Ignored'),
        ('booked', 'Booked'),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='cold_email_entries',
        db_index=True,
    )
    company = models.CharField(max_length=255, default='', blank=True)
    role_applying_for = models.CharField(max_length=255, default='', blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='ignored')
    tags = models.JSONField(default=list, blank=True)
    notes = models.TextField(default='', blank=True)
    follow_up_date = models.CharField(max_length=20, default='', blank=True)  # stored as ISO date string
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return f"{self.company} — {self.role_applying_for} ({self.user})"


class ColdEmailRecipient(models.Model):
    entry = models.ForeignKey(ColdEmailEntry, on_delete=models.CASCADE, related_name='recipients')
    full_name = models.CharField(max_length=255, default='', blank=True)
    email = models.EmailField(default='', blank=True)
    avatar = models.URLField(default='', blank=True)

    class Meta:
        ordering = ['id']


class ColdEmailMessage(models.Model):
    """The initial message sent (one per entry)."""
    entry = models.OneToOneField(ColdEmailEntry, on_delete=models.CASCADE, related_name='message')
    subject = models.CharField(max_length=500, default='', blank=True)
    date = models.CharField(max_length=20, default='', blank=True)  # ISO date string
    read = models.BooleanField(default=False)
    response = models.BooleanField(default=False)
    email_sent = models.TextField(default='', blank=True)


class ColdEmailFollowUp(models.Model):
    """Up to 4 follow-ups per entry."""
    entry = models.ForeignKey(ColdEmailEntry, on_delete=models.CASCADE, related_name='follow_ups')
    date = models.CharField(max_length=20, default='', blank=True)
    read = models.BooleanField(default=False)
    order = models.PositiveSmallIntegerField(default=0)

    class Meta:
        ordering = ['order', 'id']
