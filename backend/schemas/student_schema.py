from typing import Dict, Any, Optional

class StudentProfileSchema:
    def __init__(self, data: Dict[str, Any]):
        self.studentId: Optional[str] = data.get("studentId")
        self.department: Optional[str] = data.get("department")
        self.semester: Optional[int] = data.get("semester")
        self.hostel: Optional[str] = data.get("hostel")
        self.roomNumber: Optional[str] = data.get("roomNumber")
        self.parentName: Optional[str] = data.get("parentName")
        self.parentPhone: Optional[str] = data.get("parentPhone")

    def to_dict(self) -> Dict[str, Any]:
        d = {}
        for key in ["studentId", "department", "semester", "hostel", "roomNumber", "parentName", "parentPhone"]:
            val = getattr(self, key)
            if val is not None:
                d[key] = val
        return d
