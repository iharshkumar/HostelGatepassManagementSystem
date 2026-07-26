from typing import Dict, Any, Optional

class RegisterSchema:
    def __init__(self, data: Dict[str, Any]):
        self.fullName: str = data.get("fullName", "").strip()
        self.email: str = data.get("email", "").strip().lower()
        self.password: str = data.get("password", "")
        self.role: str = data.get("role", "Student")
        self.hostel: Optional[str] = data.get("hostel")
        self.roomNumber: Optional[str] = data.get("roomNumber")
        self.phone: Optional[str] = data.get("phone")

    def to_dict(self) -> Dict[str, Any]:
        return {
            "fullName": self.fullName,
            "email": self.email,
            "role": self.role,
            "hostel": self.hostel,
            "roomNumber": self.roomNumber,
            "phone": self.phone,
        }

class LoginSchema:
    def __init__(self, data: Dict[str, Any]):
        self.email: str = data.get("email", "").strip().lower()
        self.password: str = data.get("password", "")
