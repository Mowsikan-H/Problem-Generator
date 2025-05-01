from django.urls import path
from .views import RequestSignupOTPView, LoginView, VerifyOTPView
from .views import trigger_test_otp
from .views import GetOTPView  # Add this
from .views import RequestSignupOTPView

urlpatterns = [
    #path('signup/', RequestSignupOTPView.as_view()),
    path('login/', LoginView.as_view()),
    path('verify-otp/', VerifyOTPView.as_view()),
    path('get-otp/', GetOTPView.as_view()),  # ✅ New route
    path('test-otp/', trigger_test_otp),
    path('signup-request-otp/', RequestSignupOTPView.as_view()),
]
