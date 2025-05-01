# filepath: c:\Users\shant\OneDrive\Desktop\problemAPItest\backend\accounts\signals.py
from allauth.socialaccount.signals import social_account_added
from rest_framework_simplejwt.tokens import RefreshToken
from django.dispatch import receiver

@receiver(social_account_added)
def generate_jwt_token(sender, request, sociallogin, **kwargs):
    user = sociallogin.user
    refresh = RefreshToken.for_user(user)
    return {
        'refresh': str(refresh),
        'access': str(refresh.access_token),
    }