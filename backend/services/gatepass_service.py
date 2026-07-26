from bson import ObjectId
from datetime import datetime, timezone
from typing import Dict, Any, Tuple, Optional, List
from config.database import get_db
from models.gatepass import GatePassModel
from models.user import UserModel
from utils.helpers import serialize_doc, serialize_list

class GatePassService:
    @staticmethod
    def apply_gatepass(user_id: str, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        db = get_db()
        users_col = db[UserModel.collection_name]
        gatepass_col = db[GatePassModel.collection_name]

        try:
            user = users_col.find_one({"_id": ObjectId(user_id)})
        except Exception:
            user = None

        student_name = user.get("fullName", "") if user else ""
        hostel = user.get("hostel", "") if user else ""
        room_number = user.get("roomNumber", "") if user else ""

        doc = GatePassModel.create_gatepass_doc(
            student_id=user_id,
            reason=data.get("reason", ""),
            destination=data.get("destination", ""),
            leave_date=data.get("leaveDate", ""),
            return_date=data.get("returnDate", ""),
            student_name=student_name,
            hostel=hostel,
            room_number=room_number
        )

        res = gatepass_col.insert_one(doc)
        doc["_id"] = res.inserted_id
        return True, "Gatepass applied successfully", serialize_doc(doc)

    @staticmethod
    def edit_gatepass(gatepass_id: str, user_id: str, data: Dict[str, Any]) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        db = get_db()
        gatepass_col = db[GatePassModel.collection_name]

        try:
            gp = gatepass_col.find_one({"_id": ObjectId(gatepass_id)})
        except Exception:
            return False, "Invalid gatepass ID", None

        if not gp:
            return False, "Gatepass not found", None

        if gp.get("studentId") != user_id:
            return False, "Unauthorized to edit this gatepass", None

        if gp.get("status") != GatePassModel.STATUS_PENDING:
            return False, f"Cannot edit gatepass with status '{gp.get('status')}'", None

        update_fields = {
            "reason": data.get("reason", gp.get("reason")),
            "destination": data.get("destination", gp.get("destination")),
            "leaveDate": data.get("leaveDate", gp.get("leaveDate")),
            "returnDate": data.get("returnDate", gp.get("returnDate")),
            "updatedAt": datetime.now(timezone.utc)
        }

        gatepass_col.update_one({"_id": ObjectId(gatepass_id)}, {"$set": update_fields})
        updated = gatepass_col.find_one({"_id": ObjectId(gatepass_id)})
        return True, "Gatepass updated successfully", serialize_doc(updated)

    @staticmethod
    def cancel_gatepass(gatepass_id: str, user_id: str) -> Tuple[bool, str]:
        db = get_db()
        gatepass_col = db[GatePassModel.collection_name]

        try:
            gp = gatepass_col.find_one({"_id": ObjectId(gatepass_id)})
        except Exception:
            return False, "Invalid gatepass ID"

        if not gp:
            return False, "Gatepass not found"

        if gp.get("studentId") != user_id:
            return False, "Unauthorized to cancel this gatepass"

        if gp.get("status") not in [GatePassModel.STATUS_PENDING, GatePassModel.STATUS_APPROVED]:
            return False, f"Cannot cancel gatepass with status '{gp.get('status')}'"

        gatepass_col.update_one(
            {"_id": ObjectId(gatepass_id)},
            {"$set": {
                "status": GatePassModel.STATUS_CANCELLED,
                "updatedAt": datetime.now(timezone.utc)
            }}
        )
        return True, "Gatepass cancelled successfully"

    @staticmethod
    def approve_gatepass(gatepass_id: str, warden_name: str, remarks: str = "") -> Tuple[bool, str]:
        db = get_db()
        gatepass_col = db[GatePassModel.collection_name]

        try:
            gp = gatepass_col.find_one({"_id": ObjectId(gatepass_id)})
        except Exception:
            return False, "Invalid gatepass ID"

        if not gp:
            return False, "Gatepass not found"

        gatepass_col.update_one(
            {"_id": ObjectId(gatepass_id)},
            {"$set": {
                "status": GatePassModel.STATUS_APPROVED,
                "approvedBy": warden_name,
                "remarks": remarks,
                "updatedAt": datetime.now(timezone.utc)
            }}
        )
        return True, "Gatepass approved successfully"

    @staticmethod
    def reject_gatepass(gatepass_id: str, warden_name: str, remarks: str = "") -> Tuple[bool, str]:
        db = get_db()
        gatepass_col = db[GatePassModel.collection_name]

        try:
            gp = gatepass_col.find_one({"_id": ObjectId(gatepass_id)})
        except Exception:
            return False, "Invalid gatepass ID"

        if not gp:
            return False, "Gatepass not found"

        gatepass_col.update_one(
            {"_id": ObjectId(gatepass_id)},
            {"$set": {
                "status": GatePassModel.STATUS_REJECTED,
                "approvedBy": warden_name,
                "remarks": remarks,
                "updatedAt": datetime.now(timezone.utc)
            }}
        )
        return True, "Gatepass rejected successfully"

    @staticmethod
    def check_out_gatepass(gatepass_id: str, guard_name: str) -> Tuple[bool, str]:
        db = get_db()
        gatepass_col = db[GatePassModel.collection_name]

        try:
            gp = gatepass_col.find_one({"_id": ObjectId(gatepass_id)})
        except Exception:
            return False, "Invalid gatepass ID"

        if not gp:
            return False, "Gatepass not found"

        if gp.get("status") != GatePassModel.STATUS_APPROVED:
            return False, f"Gatepass must be Approved before Check Out. Current status: '{gp.get('status')}'"

        now_str = datetime.now(timezone.utc).isoformat()
        gatepass_col.update_one(
            {"_id": ObjectId(gatepass_id)},
            {"$set": {
                "status": GatePassModel.STATUS_CHECKED_OUT,
                "checkOutTime": now_str,
                "checkOutBy": guard_name,
                "updatedAt": datetime.now(timezone.utc)
            }}
        )
        return True, "Student checked out successfully"

    @staticmethod
    def check_in_gatepass(gatepass_id: str, guard_name: str) -> Tuple[bool, str]:
        db = get_db()
        gatepass_col = db[GatePassModel.collection_name]

        try:
            gp = gatepass_col.find_one({"_id": ObjectId(gatepass_id)})
        except Exception:
            return False, "Invalid gatepass ID"

        if not gp:
            return False, "Gatepass not found"

        if gp.get("status") != GatePassModel.STATUS_CHECKED_OUT:
            return False, f"Gatepass must be Checked Out before Check In. Current status: '{gp.get('status')}'"

        now_str = datetime.now(timezone.utc).isoformat()
        gatepass_col.update_one(
            {"_id": ObjectId(gatepass_id)},
            {"$set": {
                "status": GatePassModel.STATUS_CHECKED_IN,
                "checkInTime": now_str,
                "checkInBy": guard_name,
                "updatedAt": datetime.now(timezone.utc)
            }}
        )
        return True, "Student checked in successfully"

    @staticmethod
    def list_gatepasses(
        status: Optional[str] = None,
        search: Optional[str] = None,
        student_id: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        db = get_db()
        gatepass_col = db[GatePassModel.collection_name]

        query = {}
        if status:
            query["status"] = status
        if student_id:
            query["studentId"] = student_id
        if search:
            or_conditions = [
                {"destination": {"$regex": search, "$options": "i"}},
                {"reason": {"$regex": search, "$options": "i"}},
                {"studentName": {"$regex": search, "$options": "i"}},
                {"hostel": {"$regex": search, "$options": "i"}},
                {"roomNumber": {"$regex": search, "$options": "i"}}
            ]
            if ObjectId.is_valid(search):
                or_conditions.append({"_id": ObjectId(search)})
            query["$or"] = or_conditions

        results = list(gatepass_col.find(query).sort("createdAt", -1))
        return serialize_list(results)

    @staticmethod
    def get_statistics() -> Dict[str, Any]:
        db = get_db()
        gatepass_col = db[GatePassModel.collection_name]
        users_col = db[UserModel.collection_name]

        total_requests = gatepass_col.count_documents({})
        pending = gatepass_col.count_documents({"status": GatePassModel.STATUS_PENDING})
        approved = gatepass_col.count_documents({"status": GatePassModel.STATUS_APPROVED})
        rejected = gatepass_col.count_documents({"status": GatePassModel.STATUS_REJECTED})
        cancelled = gatepass_col.count_documents({"status": GatePassModel.STATUS_CANCELLED})
        checked_out = gatepass_col.count_documents({"status": GatePassModel.STATUS_CHECKED_OUT})
        checked_in = gatepass_col.count_documents({"status": GatePassModel.STATUS_CHECKED_IN})

        total_students = users_col.count_documents({"role": "Student"})
        total_wardens = users_col.count_documents({"role": "Warden"})
        total_guards = users_col.count_documents({"role": "Security Guard"})

        return {
            "totalRequests": total_requests,
            "pendingRequests": pending,
            "approvedRequests": approved,
            "rejectedRequests": rejected,
            "cancelledRequests": cancelled,
            "checkedOutRequests": checked_out,
            "checkedInRequests": checked_in,
            "totalStudents": total_students,
            "totalWardens": total_wardens,
            "totalGuards": total_guards
        }
