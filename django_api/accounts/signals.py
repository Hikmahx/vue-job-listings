from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import User, JobSeekerProfile, FounderProfile

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if not created:
        return

    if instance.role == 'job_seeker':
        JobSeekerProfile.objects.create(user=instance)

    elif instance.role == 'founder':
        FounderProfile.objects.create(user=instance)
