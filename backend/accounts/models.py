
# Create your models here.
from django.db import models
from django.contrib.auth.models import User
import random

from datetime import timedelta
from django.utils import timezone

class UserOTP(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)

    def generate_otp(self):
        self.otp = str(random.randint(100000, 999999))
        self.created_at = timezone.now()
        self.save()

    def is_expired(self):
        return self.created_at < timezone.now() - timedelta(minutes=10)


