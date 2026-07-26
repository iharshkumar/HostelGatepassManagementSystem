from datetime import datetime, timezone
from typing import Dict, Any, Optional

class GatePassModel:
    collection_name = "gatepasses"

    STATUS_PENDING = "Pending"
    STATUS_APPROVED = "Approved"
    STATUS_REJECTED = "Rejected"
    STATUS_CANCELLED = "Cancelled"
    STATUS_CHECKED_OUT = "Checked Out"
    STATUS_CHECKED_IN = "Checked In"

    VALID_STATUSES = [
        STATUS_PENDING, STATUS_APPROVED, STATUS_REJECTED,
        STATUS_CANCELLED, STATUS_CHECKED_OUT, STATUS_CHECKED_IN
    ]

    @staticmethod
    def create_gatepass_doc(
        student_id: str,
        reason: str,
        destination: str,
        leave_date: str,
        return_date: str,
        student_name: Optional[str] = None,
        hostel: Optional[str] = None,
        room_number: Optional[str] = None
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        return {
            "studentId": student_id,
            "studentName": student_name or "",
            "hostel": hostel or "",
            "roomNumber": room_number or "",
            "reason": reason,
            "destination": destination,
            "leaveDate": leave_date,
            "returnDate": return_date,
            "status": GatePassModel.STATUS_PENDING,
            "approvedBy": None,
            "remarks": "",
            "checkOutTime": None,
            "checkOutBy": None,
            "checkInTime": None,
            "checkInBy": None,
            "createdAt": now,
            "updatedAt": now
        }
