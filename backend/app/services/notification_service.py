import httpx
import logging
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

class NotificationService:
    def __init__(self):
        self.api_key = settings.BREVO_API_KEY
        self.sender = {"name": settings.SENDER_NAME, "email": settings.SENDER_EMAIL}
        self.url = "https://api.brevo.com/v3/smtp/email"

    async def send_booking_confirmation(self, user_email: str, user_name: str, trip_details: dict):
        """Notifies the passenger that their seat is officially reserved."""
        html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333;">
                    <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px;">
                        <h2 style="color: #2ecc71;">Booking Confirmed! 🚗</h2>
                        <p>Hello <b>{user_name}</b>,</p>
                        <p>Your seat has been verified. Pack your bags!</p>
                        <hr style="border: 0; border-top: 1px solid #eee;" />
                        <p><b>Route:</b> {trip_details['origin'].title()} ➔ {trip_details['destination'].title()}</p>
                        <p><b>Departure:</b> {trip_details['departure_time']}</p>
                        <p><b>Vehicle:</b> {trip_details.get('car_model', 'Standard Sedan')}</p>
                        <p><b>Driver Contact:</b> {trip_details.get('driver_phone', 'Available in App')}</p>
                        <br>
                        <p>Safe travels,<br>The {settings.PROJECT_NAME} Team</p>
                    </div>
                </body>
            </html>
        """
        return await self._execute_send(user_email, f"Seat Confirmed: {trip_details['origin'].title()} to {trip_details['destination'].title()}", html_content)

    async def notify_driver_new_booking(self, driver_email: str, passenger_name: str, trip_details: dict):
        """Notifies the driver when a passenger's payment is verified and they are added to the trip."""
        html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif;">
                    <h2 style="color: #3498db;">New Passenger Joined! 👥</h2>
                    <p>Great news! <b>{passenger_name}</b> has joined your trip.</p>
                    <p><b>Trip:</b> {trip_details['origin'].title()} to {trip_details['destination'].title()}</p>
                    <p><b>Remaining Seats:</b> {trip_details.get('available_seats', 'Check App')}</p>
                    <p>View your full passenger manifest in the "Cabin Manager" section of the app.</p>
                </body>
            </html>
        """
        return await self._execute_send(driver_email, "New Passenger for your Trip", html_content)

    async def send_otp_email(self, user_email: str, code: str):
        """Professional OTP template for registration or login."""
        html_content = f"""
            <div style="text-align: center; padding: 20px; border: 1px solid #ddd;">
                <h1 style="color: #444;">Verification Code</h1>
                <p>Use the code below to secure your account:</p>
                <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2c3e50; padding: 10px; background: #f4f4f4; display: inline-block;">
                    {code}
                </div>
                <p style="color: #888; font-size: 12px; margin-top: 20px;">If you didn't request this, please ignore this email.</p>
            </div>
        """
        return await self._execute_send(user_email, "Your Verification Code", html_content)

    async def _execute_send(self, to_email: str, subject: str, html: str):
        if not self.api_key:
            logger.error("❌ BREVO_API_KEY is missing. Email not sent.")
            return False

        payload = {
            "sender": self.sender,
            "to": [{"email": to_email}],
            "subject": subject,
            "htmlContent": html
        }
        headers = {
            "api-key": self.api_key, 
            "Content-Type": "application/json",
            "Accept": "application/json"
        }

        async with httpx.AsyncClient() as client:
            try:
                # Brevo returns 201 Created on success
                response = await client.post(self.url, json=payload, headers=headers, timeout=10.0)
                if response.status_code == 201:
                    return True
                else:
                    logger.warning(f"📧 Brevo Failed ({response.status_code}): {response.text}")
                    return False
            except Exception as e:
                logger.error(f"📧 Brevo Connection Error: {e}")
                return False