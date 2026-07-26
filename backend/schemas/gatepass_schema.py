from typing import Dict, Any, Optional

class ApplyGatepassSchema:
    def __init__(self, data: Dict[str, Any]):
        self.reason: str = data.get("reason", "").strip()
        self.destination: str = data.get("destination", "").strip()
        self.leaveDate: str = data.get("leaveDate", "").strip()
        self.returnDate: str = data.get("returnDate", "").strip()

    def to_dict(self) -> Dict[str, Any]:
        return {
            "reason": self.reason,
            "destination": self.destination,
            "leaveDate": self.leaveDate,
            "returnDate": self.returnDate,
        }

class ApproveGatepassSchema:
    def __init__(self, data: Dict[str, Any]):
        self.status: str = data.get("status", "Approved")  # Approved or Rejected
        self.remarks: Optional[str] = data.get("remarks", "")
