from app.repositories.user_repo import UserRepository
from decimal import Decimal, ROUND_HALF_UP
import logging

logger = logging.getLogger("uvicorn.error")

class WalletService:
    def __init__(self):
        self.user_repo = UserRepository()

    def _format_currency(self, value: Decimal) -> float:
        """Helper to ensure all wallet updates are rounded to 2 decimal places."""
        return float(value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))

    async def process_driver_payout(self, driver_id: str, amount: float):
        """
        Calculates the platform fee (5%) and pays the driver.
        Used when a trip is marked as 'completed' and paid internally.
        """
        if amount <= 0:
            logger.warning(f"Attempted invalid payout of {amount} to driver {driver_id}")
            return False

        # Convert to Decimal for financial precision
        total = Decimal(str(amount))
        # 🎯 FIXED: Aligned with the 5% global commission rule
        platform_fee = total * Decimal("0.05")
        final_payout = total - platform_fee
        
        rounded_payout = self._format_currency(final_payout)
        
        logger.info(f"Processing internal payout: Total {amount} | Fee {platform_fee} | Driver Net {rounded_payout}")
        return await self.user_repo.update_wallet(driver_id, rounded_payout)

    async def refund_passenger(self, user_id: str, amount: float):
        """
        Refunds the full amount if a trip is cancelled by the driver or admin.
        """
        if amount <= 0:
            return False
            
        return await self.user_repo.update_wallet(user_id, float(amount))

    async def add_referral_bonus(self, user_id: str):
        """
        Credit a fixed bonus for successful referrals.
        """
        bonus_amount = 50.0  # Set your desired bonus amount here
        return await self.user_repo.update_wallet(user_id, bonus_amount)

    async def check_balance_availability(self, user_id: str, required_amount: float) -> bool:
        """
        Validates if a user has enough funds (for in-app wallet payment flow).
        """
        user = await self.user_repo.get_by_id(user_id)
        if not user:
            return False
            
        current_balance = float(user.get("wallet_balance", 0.0))
        return current_balance >= required_amount