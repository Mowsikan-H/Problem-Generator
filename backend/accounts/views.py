from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .serializers import SignupSerializer, LoginSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .models import UserOTP
from .utils import send_otp_email
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.contrib.auth import get_user_model
from .serializers import UserSerializer
from .models import UserOTP

User = get_user_model()

@api_view(['POST'])
@permission_classes([AllowAny])
def trigger_test_otp(request):
    try:
        user = User.objects.get(email='your_test_email@example.com')
        otp = UserOTP.objects.create(user=user)
        otp.generate_otp()
        send_otp_email(user.email, otp.otp)
        return Response({'message': 'OTP sent to test user'}, status=200)
    except User.DoesNotExist:
        return Response({'error': 'Test user not found'}, status=404)

# After creating user
# Assuming you have a specific user instance
from django.contrib.auth.models import User

# Example: Retrieve a specific user instance (replace with actual logic)
#user_instance = User.objects.get(username='example_username')  # Replace with actual user lookup logic

# Create the UserOTP object with the user instance
#user_otp = UserOTP.objects.create(user=user_instance)

#user_otp.generate_otp()
#send_otp_email(User.email, user_otp.otp)


# class SignupView(APIView):
#     permission_classes = [AllowAny]

#     def post(self, request):
#         email = request.data.get('email')
#         password = request.data.get('password')

#         if User.objects.filter(email=email).exists():
#             return Response({'error': 'Email already registered'}, status=400)

#         user = User.objects.create_user(email=email, password=password, username=email)

#         user_otp = UserOTP.objects.create(user=user)
#         user_otp.generate_otp()

#         send_otp_email(email, user_otp.otp)

#         return Response({
#             'message': 'User created successfully. OTP sent.',
#             'requireOtp': True,
#             'user_id': user.id
#         }, status=201)


class LoginView(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data['user']
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {'email': user.email}
            }, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_401_UNAUTHORIZED)
    


class RequestSignupOTPView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Email already registered'}, status=400)

        # Create a dummy user just to attach OTP
        user, _ = User.objects.get_or_create(username=email, email=email)

        user_otp, _ = UserOTP.objects.get_or_create(user=user)
        user_otp.generate_otp()
        send_otp_email(email, user_otp.otp)

        return Response({'message': 'OTP sent to email'}, status=200)


class VerifyOTPView(APIView):
    def post(self, request):
        email = request.data.get('email')
        otp = request.data.get('otp')
        password = request.data.get('password')

        if not all([email, otp, password]):
            return Response({'error': 'Missing fields'}, status=400)

        try:
            dummy_user = User.objects.get(email=email)
            user_otp = UserOTP.objects.get(user=dummy_user)

            if user_otp.is_expired():
                return Response({'error': 'OTP expired'}, status=400)

            if user_otp.otp != otp:
                return Response({'error': 'Invalid OTP'}, status=400)

            # Create real user
            dummy_user.delete()  # Remove dummy
            real_user = User.objects.create_user(username=email, email=email, password=password)

            user_otp.delete()  # Cleanup

            return Response({'verified': True}, status=200)

        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=400)
        except UserOTP.DoesNotExist:
            return Response({'error': 'OTP not found'}, status=400)

# Add this import
from rest_framework.permissions import IsAuthenticated

class GetOTPView(APIView):
    permission_classes = [AllowAny]  # or IsAuthenticated if token required

    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            if UserOTP.objects.filter(user=user).exists():
                user_otp = UserOTP.objects.get(user=user)
            else:
                user_otp = UserOTP.objects.create(user=user)
            user_otp.generate_otp()
            send_otp_email(user.email, user_otp.otp)
            return Response({'message': 'OTP sent successfully'}, status=200)
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=404)


# wjxd vifz cckv ubat