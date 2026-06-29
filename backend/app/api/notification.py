import os
import httpx
from fastapi import BackgroundTasks

# These will be loaded from your server's Environment Variables
ONESIGNAL_REST_API_KEY = os.getenv("ONESIGNAL_REST_API_KEY")
ONESIGNAL_APP_ID = os.getenv("ONESIGNAL_APP_ID")

async def send_push_notification(heading: str, message: str):
    """
    Sends a push notification to all subscribed users via OneSignal.
    """
    if not ONESIGNAL_REST_API_KEY or not ONESIGNAL_APP_ID:
        print("Error: OneSignal credentials not set in environment.")
        return

    url = "https://onesignal.com/api/v1/notifications"
    headers = {
        "Authorization": f"Bearer {ONESIGNAL_REST_API_KEY}",
        "Content-Type": "application/json; charset=utf-8"
    }
    payload = {
        "app_id": ONESIGNAL_APP_ID,
        "include_player_ids": ["da9838f9-6b4f-447a-bf42-074a291bee15"], # Your phone's ID
        "headings": {"en": heading},
        "contents": {"en": message}
    }
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            # This print will appear in your FastAPI server logs
            print(f"OneSignal Response: {response.status_code} - {response.text}")
            return response.json()
    except Exception as e:
        print(f"Failed to send notification: {str(e)}")