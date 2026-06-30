import os
import httpx
from dotenv import load_dotenv

ENV_PATH = os.path.join(os.path.dirname(__file__), '..', '..', '.env')
load_dotenv(dotenv_path=ENV_PATH, override=True)

ONESIGNAL_REST_API_KEY = (os.getenv("ONESIGNAL_REST_API_KEY") or "").strip().strip('"').strip("'")
ONESIGNAL_APP_ID = (os.getenv("ONESIGNAL_APP_ID") or "").strip().strip('"').strip("'")


async def send_push_notification(
    heading: str,
    message: str,
    subscription_ids: list[str] | None = None,
):
    """
    Sends a push notification via OneSignal.

    - If `subscription_ids` is provided, sends only to those specific subscriptions.
    - If omitted, sends to all subscribed users.
    """
    if not ONESIGNAL_REST_API_KEY or not ONESIGNAL_APP_ID:
        print("Error: OneSignal credentials not set in environment (.env).")
        return

    url = "https://api.onesignal.com/notifications"
    headers = {
        "Authorization": f"Key {ONESIGNAL_REST_API_KEY}",
        "Content-Type": "application/json; charset=utf-8",
    }

    payload = {
        "app_id": ONESIGNAL_APP_ID,
        "target_channel": "push",
        "headings": {"en": heading},
        "contents": {"en": message},
    }

    if subscription_ids:
        payload["include_subscription_ids"] = subscription_ids
    else:
        payload["included_segments"] = ["Subscribed Users"]

    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, headers=headers, json=payload)
            print(f"OneSignal Response: {response.status_code} - {response.text}")
            return response.json()
    except Exception as e:
        print(f"Failed to send notification: {str(e)}")