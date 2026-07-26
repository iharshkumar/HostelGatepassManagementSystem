import re
from datetime import datetime
from bson import ObjectId
from typing import List, Dict, Any, Tuple

EMAIL_REGEX = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
PHONE_REGEX = re.compile(r"^\+?[0-9]{10,15}$")

def is_valid_email(email: str) -> bool:
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email.strip()))

def is_valid_phone(phone: str) -> bool:
    if not phone or not isinstance(phone, str):
        return False
    clean_phone = phone.replace(" ", "").replace("-", "")
    return bool(PHONE_REGEX.match(clean_phone))

def is_valid_object_id(oid: str) -> bool:
    if not oid or not isinstance(oid, str):
        return False
    return ObjectId.is_valid(oid)

def validate_register_input(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    errors = []
    required_fields = ["fullName", "email", "password", "role"]
    for field in required_fields:
        if not data.get(field):
            errors.append(f"Field '{field}' is required")

    email = data.get("email", "")
    if email and not is_valid_email(email):
        errors.append("Invalid email address format")

    password = data.get("password", "")
    if password and len(password) < 6:
        errors.append("Password must be at least 6 characters long")

    role = data.get("role", "")
    valid_roles = ["Student", "Warden", "Admin", "Security Guard"]
    if role and role not in valid_roles:
        errors.append(f"Role must be one of: {', '.join(valid_roles)}")

    phone = data.get("phone", "")
    if phone and not is_valid_phone(phone):
        errors.append("Invalid phone number format")

    return len(errors) == 0, errors

def validate_login_input(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    errors = []
    if not data.get("email"):
        errors.append("Email is required")
    if not data.get("password"):
        errors.append("Password is required")
    return len(errors) == 0, errors

def validate_gatepass_input(data: Dict[str, Any]) -> Tuple[bool, List[str]]:
    errors = []
    required_fields = ["reason", "destination", "leaveDate", "returnDate"]
    for field in required_fields:
        if not data.get(field):
            errors.append(f"Field '{field}' is required")

    leave_date = data.get("leaveDate")
    return_date = data.get("returnDate")

    if leave_date and return_date:
        try:
            # Parse ISO date strings or standard datetime formats
            ld = datetime.fromisoformat(leave_date.replace("Z", "+00:00"))
            rd = datetime.fromisoformat(return_date.replace("Z", "+00:00"))
            if rd <= ld:
                errors.append("Return date must be after leave date")
        except ValueError:
            errors.append("Invalid date format. Use ISO format (e.g. YYYY-MM-DDTHH:MM)")

    return len(errors) == 0, errors
