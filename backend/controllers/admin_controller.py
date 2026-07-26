from flask import request
from services.gatepass_service import GatePassService
from services.auth_service import AuthService
from utils.response import success_response, error_response
from config.database import get_db
from models.user import UserModel
from models.hostel import HostelModel
from utils.helpers import serialize_doc, serialize_list
from bson import ObjectId

def get_dashboard_stats():
    stats = GatePassService.get_statistics()
    return success_response(data=stats, message="Dashboard statistics retrieved")

def list_users():
    users = AuthService.get_all_users()
    return success_response(data=users, message="User list retrieved")

def update_user_role(user_id):
    data = request.get_json() or {}
    new_role = data.get("role")
    valid_roles = ["Student", "Warden", "Admin"]

    if new_role not in valid_roles:
        return error_response(f"Role must be one of: {', '.join(valid_roles)}", status_code=400)

    db = get_db()
    users_col = db[UserModel.collection_name]
    try:
        res = users_col.update_one({"_id": ObjectId(user_id)}, {"$set": {"role": new_role}})
        if res.matched_count == 0:
            return error_response("User not found", status_code=404)
        return success_response(message=f"User role updated to {new_role}")
    except Exception as e:
        return error_response(message=str(e), status_code=400)

def delete_user(user_id):
    db = get_db()
    users_col = db[UserModel.collection_name]
    try:
        res = users_col.delete_one({"_id": ObjectId(user_id)})
        if res.deleted_count == 0:
            return error_response("User not found", status_code=404)
        return success_response(message="User deleted successfully")
    except Exception as e:
        return error_response(message=str(e), status_code=400)

def list_hostels():
    db = get_db()
    hostel_col = db[HostelModel.collection_name]
    hostels = list(hostel_col.find({}))
    return success_response(data=serialize_list(hostels), message="Hostels retrieved")

def create_hostel():
    data = request.get_json() or {}
    hostel_name = data.get("hostelName")
    warden_name = data.get("wardenName")
    capacity = data.get("capacity", 100)

    if not hostel_name or not warden_name:
        return error_response("hostelName and wardenName are required", status_code=400)

    db = get_db()
    hostel_col = db[HostelModel.collection_name]
    doc = HostelModel.create_hostel_doc(hostel_name=hostel_name, warden_name=warden_name, capacity=int(capacity))
    res = hostel_col.insert_one(doc)
    doc["_id"] = res.inserted_id

    return success_response(data=serialize_doc(doc), message="Hostel created successfully", status_code=201)
