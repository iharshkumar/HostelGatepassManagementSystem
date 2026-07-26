from typing import Dict, Any, Optional

class StudentModel:
    collection_name = "students"

    @staticmethod
    def create_student_doc(
        user_id: str,
        student_id: str,
        department: Optional[str] = None,
        semester: Optional[int] = None,
        hostel: Optional[str] = None,
        room_number: Optional[str] = None,
        parent_name: Optional[str] = None,
        parent_phone: Optional[str] = None
    ) -> Dict[str, Any]:
        return {
            "userId": user_id,
            "studentId": student_id,
            "department": department or "",
            "semester": semester or 1,
            "hostel": hostel or "",
            "roomNumber": room_number or "",
            "parentName": parent_name or "",
            "parentPhone": parent_phone or ""
        }
