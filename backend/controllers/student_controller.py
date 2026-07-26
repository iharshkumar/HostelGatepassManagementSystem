from flask import request, g
from services.auth_service import AuthService
from services.gatepass_service import GatePassService
from utils.response import success_response, error_response
from config.database import get_db
from models.student import StudentModel
from models.user import UserModel
from bson import ObjectId

def get_student_profile():
    user_id = g.current_user.get("user_id")
    user = AuthService.get_user_by_id(user_id)
    if not user:
        return error_response("Student profile not found", status_code=404)

    db = get_db()
    students_col = db[StudentModel.collection_name]
    student_details = students_col.find_one({"userId": user_id})

    profile_data = {
        **user,
        "department": student_details.get("department", "") if student_details else "",
        "semester": student_details.get("semester", 1) if student_details else 1,
        "studentId": student_details.get("studentId", "") if student_details else "",
        "parentName": student_details.get("parentName", "") if student_details else "",
        "parentPhone": student_details.get("parentPhone", "") if student_details else ""
    }
    return success_response(data=profile_data, message="Student profile retrieved")

def update_student_profile():
    user_id = g.current_user.get("user_id")
    data = request.get_json() or {}

    db = get_db()
    users_col = db[UserModel.collection_name]
    students_col = db[StudentModel.collection_name]

    user_updates = {}
    for key in ["fullName", "phone", "hostel", "roomNumber"]:
        if key in data:
            user_updates[key] = data[key]

    if user_updates:
        users_col.update_one({"_id": ObjectId(user_id)}, {"$set": user_updates})

    student_updates = {}
    for key in ["department", "semester", "parentName", "parentPhone"]:
        if key in data:
            student_updates[key] = data[key]

    if student_updates:
        students_col.update_one({"userId": user_id}, {"$set": student_updates}, upsert=True)

    return success_response(message="Student profile updated successfully")

def get_own_gatepasses():
    user_id = g.current_user.get("user_id")
    status = request.args.get("status")
    search = request.args.get("search")

    results = GatePassService.list_gatepasses(status=status, search=search, student_id=user_id)
    return success_response(data=results, message="Student gatepass history retrieved")
