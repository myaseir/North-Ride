from app.db.mongodb import db
from datetime import datetime, timezone
from bson import ObjectId

class ReportRepository:
    @property
    def collection(self):
        return db.db.reports

    async def create_report(self, report_data: dict):
        """Saves a safety or service report."""
        report_data["created_at"] = datetime.now(timezone.utc)
        report_data["status"] = "open"
        
        # Ensure ID fields are ObjectIds if applicable
        if "trip_id" in report_data:
            report_data["trip_id"] = ObjectId(report_data["trip_id"])
            
        result = await self.collection.insert_one(report_data)
        return str(result.inserted_id)

    async def get_all_reports(self):
        reports = await self.collection.find().sort("created_at", -1).to_list(length=100)
        for r in reports:
            r["_id"] = str(r["_id"])
        return reports