from bson import ObjectId
from typing import Dict, Any, Tuple, Optional, List
from config.database import get_db
from models.user import UserModel
from models.student import StudentModel
from utils.helpers import check_password, hash_password, generate_jwt_token, serialize_doc, serialize_list

class AuthService:
    @staticmethod
    def register_user(data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        db = get_db()
        users_col = db[UserModel.collection_name]

        email = data.get("email", "").lower().strip()
        existing = users_col.find_one({"email": email})
        if existing:
            return False, "User with this email already exists", None

        user_doc = UserModel.create_user_doc(
            full_name=data.get("fullName", ""),
            email=email,
            password_raw=data.get("password", ""),
            role=data.get("role", "Student"),
            hostel=data.get("hostel"),
            room_number=data.get("roomNumber"),
            phone=data.get("phone")
        )

        result = users_col.insert_one(user_doc)
        user_id = str(result.inserted_id)

        # If role is Student, initialize student record
        if data.get("role") == "Student":
            students_col = db[StudentModel.collection_name]
            student_id = data.get("studentId") or f"STU-{user_id[-6:].upper()}"
            student_doc = StudentModel.create_student_doc(
                user_id=user_id,
                student_id=student_id,
                department=data.get("department"),
                semester=data.get("semester"),
                hostel=data.get("hostel"),
                room_number=data.get("roomNumber"),
                parent_name=data.get("parentName"),
                parent_phone=data.get("parentPhone")
            )
            students_col.insert_one(student_doc)

        user_doc["_id"] = result.inserted_id
        token = generate_jwt_token(user_id=user_id, role=user_doc["role"], email=user_doc["email"])

        user_data = serialize_doc(user_doc)
        if user_data:
            user_data.pop("password", None)

        return True, "Registration successful", {"user": user_data, "token": token}

    @staticmethod
    def login_user(data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        db = get_db()
        users_col = db[UserModel.collection_name]

        email = data.get("email", "").lower().strip()
        password = data.get("password", "")

        user = users_col.find_one({"email": email})
        if not user:
            return False, "Invalid email or password", None

        if not check_password(password, user.get("password", "")):
            return False, "Invalid email or password", None

        user_id = str(user["_id"])
        token = generate_jwt_token(user_id=user_id, role=user.get("role", "Student"), email=user["email"])

        user_data = serialize_doc(user)
        if user_data:
            user_data.pop("password", None)

        return True, "Login successful", {"user": user_data, "token": token}

    @staticmethod
    def get_user_by_id(user_id: str) -> Optional[Dict[str, Any]]:
        db = get_db()
        users_col = db[UserModel.collection_name]
        try:
            user = users_col.find_one({"_id": ObjectId(user_id)})
            if user:
                user_data = serialize_doc(user)
                if user_data:
                    user_data.pop("password", None)
                return user_data
        except Exception:
            return None
        return None

    @staticmethod
    def update_password(user_id: str, old_pass: str, new_pass: str) -> Tuple[bool, str]:
        db = get_db()
        users_col = db[UserModel.collection_name]
        try:
            user = users_col.find_one({"_id": ObjectId(user_id)})
            if not user:
                return False, "User not found"

            if not check_password(old_pass, user.get("password", "")):
                return False, "Current password is incorrect"

            new_hashed = hash_password(new_pass)
            users_col.update_one({"_id": ObjectId(user_id)}, {"$set": {"password": new_hashed}})
            return True, "Password updated successfully"
        except Exception as e:
            return False, str(e)

    @staticmethod
    def get_all_users() -> List[Dict[str, Any]]:
        db = get_db()
        users_col = db[UserModel.collection_name]
        users = list(users_col.find({}))
        serialized = serialize_list(users)
        for u in serialized:
            u.pop("password", None)
        return serialized
