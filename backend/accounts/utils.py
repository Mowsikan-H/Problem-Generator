from django.core.mail import send_mail

def send_otp_email(email, otp):
    subject = 'Your YAIIA Verification OTP'
    message = f'Your one-time password (OTP) is: {otp}'
    from_email = 'your_email@gmail.com'
    send_mail(subject, message, from_email, [email])
