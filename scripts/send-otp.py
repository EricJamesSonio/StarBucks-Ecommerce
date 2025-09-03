import smtplib
import sys
import re
from email.mime.text import MIMEText

def is_valid_email(email):
    return re.match(r"^[^@]+@[^@]+\.[^@]+$", email)

def send_otp(email, otp):
    msg = MIMEText(f"Your OTP is {otp}. It expires in 5 minutes.")
    msg["Subject"] = "Starbucks OTP"
    msg["From"] = "eriesjoy1209@gmail.com"
    msg["To"] = email

    with smtplib.SMTP("smtp.gmail.com", 587) as server:
        server.starttls()
        server.login("eriesjoy1209@gmail.com", "qift bzzq talp sbpf")
        server.send_message(msg)
        print(f"Sending OTP {otp} to {email}")  # ✅ Debug log

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: send-otp.py <email> <otp>")
        sys.exit(1)

    email, otp = sys.argv[1], sys.argv[2]

    if not is_valid_email(email):
        print("Error: Invalid email format")
        sys.exit(1)

    try:
        send_otp(email, otp)
        sys.exit(0)
    except Exception as e:
        print("Error:", e)
        sys.exit(1)
