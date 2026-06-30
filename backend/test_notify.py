import asyncio
from app.api.notification import send_push_notification

async def main():
    print("Sending test notification...")
    result = await send_push_notification(
        "Test Heading",
        "This is a terminal test message.",
        subscription_ids=["a9dece49-1daf-4d84-a0ba-7f89f88952b3"],
    )
    print(f"Result: {result}")

if __name__ == "__main__":
    asyncio.run(main())