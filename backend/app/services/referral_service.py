from datetime import datetime, timezone

class ReferralService:
    @staticmethod
    def calculate_loyalty_tier(completed_trips: int) -> str:
        if completed_trips >= 150: return "Master Hero"
        if completed_trips >= 100: return "Diamond"
        if completed_trips >= 50: return "Gold"
        if completed_trips >= 20: return "Silver"
        return "Bronze"

    @staticmethod
    async def process_referral_check(referrer_id, new_user_id, device_fingerprint, user_repo):
        # 1. Check if device_fingerprint exists in user's history
        existing = await user_repo.find_user_by_fingerprint(device_fingerprint)
        if existing:
            # Send to Admin Audit Center
            await user_repo.create_audit_request(referrer_id, new_user_id, "Duplicate Device")
            return "PENDING_AUDIT"
        return "APPROVED"