import httpx
import logging
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

class NotificationService:
    def __init__(self):
        self.api_key = settings.BREVO_API_KEY
        self.sender = {"name": settings.SENDER_NAME, "email": settings.SENDER_EMAIL}
        self.url = "https://api.brevo.com/v3/smtp/email"

    # 🎯 FIX: Added driver_info to the signature
    async def send_booking_confirmation(self, user_email: str, user_name: str, trip_details: dict, driver_info: dict):
        """Notifies the passenger that their seat is officially reserved."""
        
        # 🎯 FIX: Formatting the departure time nicely for the email
        raw_time = trip_details.get('departure_time')
        formatted_time = raw_time.strftime("%b %d, %Y at %I:%M %p") if hasattr(raw_time, 'strftime') else str(raw_time)

        html_content = f"""
            <html>
                <body style="font-family: Arial, sans-serif; color: #333; line-height: 1.6;">
                    <div style="max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 15px;">
                        <h2 style="color: #2ecc71; text-align: center;">Booking Confirmed! 🚗</h2>
                        <p>Hello <b>{user_name}</b>,</p>
                        <p>Your seat on <b>North Ride</b> has been verified. Pack your bags!</p>
                        <hr style="border: 0; border-top: 1px solid #eee;" />
                        
                        <div style="background: #f9f9f9; padding: 15px; border-radius: 10px;">
                            <p style="margin: 5px 0;"><b>Route:</b> {trip_details['origin'].title()} ➔ {trip_details['destination'].title()}</p>
                            <p style="margin: 5px 0;"><b>Departure:</b> {formatted_time}</p>
                        </div>

                        <h3 style="color: #34495e; margin-top: 20px;">Captain & Vehicle Details</h3>
                        <div style="background: #eafaf1; padding: 15px; border-radius: 10px; border-left: 5px solid #2ecc71;">
                            <p style="margin: 5px 0;"><b>Captain:</b> {driver_info.get('name', 'Professional Captain')}</p>
                            <p style="margin: 5px 0;"><b>Vehicle:</b> {driver_info.get('car_details', 'Verified Vehicle')}</p>
                            <p style="margin: 5px 0;"><b>Contact:</b> {driver_info.get('contact_1', 'Available in App')}</p>
                        </div>

                        <p style="font-size: 12px; color: #7f8c8d; margin-top: 25px; text-align: center;">
                            Safe travels with North Ride Pakistan.
                        </p>
                    </div>
                </body>
            </html>
        """
        subject = f"Seat Confirmed: {trip_details['origin'].title()} to {trip_details['destination'].title()}"
        return await self._execute_send(user_email, subject, html_content)

    async def notify_driver_new_booking(self, driver_email: str, passenger_name: str, trip_details: dict):
        # ... (This logic is fine as is) ...
        pass

    async def send_otp_email(self, user_email: str, code: str):
        # ... (This logic is fine as is) ...
        pass

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

        # 🎯 PRO TIP: Using a single client instance is better for serverless performance
        # but for individual triggers, this context manager is safe.
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.url, json=payload, headers=headers, timeout=10.0)
                if response.status_code in [201, 200, 202]:
                    return True
                else:
                    logger.warning(f"📧 Brevo Failed ({response.status_code}): {response.text}")
                    return False
            except Exception as e:
                logger.error(f"📧 Brevo Connection Error: {e}")
                return False