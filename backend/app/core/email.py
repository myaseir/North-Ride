import httpx
from app.core.config import settings

async def send_otp_email(email_to: str, otp_code: str):
    """Sends email via Brevo's HTTP API (No SMTP needed)."""
    url = "https://api.brevo.com/v3/smtp/email"
    
    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": settings.BREVO_API_KEY.strip()
    }
    
    payload = {
        "sender": {
            "name": settings.SENDER_NAME,
            "email": settings.SENDER_EMAIL.strip()
        },
        "to": [{"email": email_to}],
        "subject": "Glacia Go - Your Verification Code",
        "htmlContent": f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee;">
            <h2 style="color: #10b981;">Glacia Go</h2>
            <p>Your verification code is:</p>
            <h1 style="letter-spacing: 5px; color: #111;">{otp_code}</h1>
            <p style="font-size: 12px; color: #888;">This code expires in 10 minutes.</p>
        </div>
        """
    }

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            
        if response.status_code in [201, 202, 200]:
            return True
        else:
            print(f"BREVO API ERROR: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"NETWORK ERROR: {str(e)}")
        return False