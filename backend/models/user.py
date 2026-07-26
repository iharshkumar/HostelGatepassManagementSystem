from datetime import datetime, timezone
from typing import Dict, Any, Optional
from utils.helpers import hash_password, serialize_doc

class UserModel:
    collection_name = "users"

    @staticmethod
    def create_user_doc(
        full_name: str,
        email: str,
        password_raw: str,
        role: str = "Student",
        hostel: Optional[str] = None,
        room_number: Optional[str] = None,
        phone: Optional[str] = None
    ) -> Dict[str, Any]:
        now = datetime.now(timezone.utc)
        return {
            "fullName": full_name,
            "email": email.lower(),
            "password": hash_password(password_raw),
            "role": role,
            "hostel": hostel or "",
            "roomNumber": room_number or "",
            "phone": phone or "",
            "createdAt": now,
            "updatedAt": now
        }
