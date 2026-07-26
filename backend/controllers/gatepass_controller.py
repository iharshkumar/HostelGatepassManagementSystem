from flask import request, g
from services.gatepass_service import GatePassService
from services.auth_service import AuthService
from utils.validators import validate_gatepass_input
from utils.response import success_response, error_response

def apply_gatepass():
    user_id = g.current_user.get("user_id")
    data = request.get_json() or {}

    is_valid, errors = validate_gatepass_input(data)
    if not is_valid:
        return error_response(message="Validation failed", errors=errors, status_code=400)

    success, message, result = GatePassService.apply_gatepass(user_id, data)
    if not success:
        return error_response(message=message, status_code=400)

    return success_response(data=result, message=message, status_code=201)

def edit_gatepass(gatepass_id):
    user_id = g.current_user.get("user_id")
    data = request.get_json() or {}

    success, message, result = GatePassService.edit_gatepass(gatepass_id, user_id, data)
    if not success:
        return error_response(message=message, status_code=400)

    return success_response(data=result, message=message)

def cancel_gatepass(gatepass_id):
    user_id = g.current_user.get("user_id")
    success, message = GatePassService.cancel_gatepass(gatepass_id, user_id)
    if not success:
        return error_response(message=message, status_code=400)

    return success_response(message=message)

def approve_gatepass(gatepass_id):
    data = request.get_json() or {}
    user_id = g.current_user.get("user_id")
    user = AuthService.get_user_by_id(user_id)
    warden_name = user.get("fullName", "Warden") if user else "Warden"

    remarks = data.get("remarks", "")
    success, message = GatePassService.approve_gatepass(gatepass_id, warden_name, remarks)
    if not success:
        return error_response(message=message, status_code=400)

    return success_response(message=message)

def reject_gatepass(gatepass_id):
    data = request.get_json() or {}
    user_id = g.current_user.get("user_id")
    user = AuthService.get_user_by_id(user_id)
    warden_name = user.get("fullName", "Warden") if user else "Warden"

    remarks = data.get("remarks", "")
    success, message = GatePassService.reject_gatepass(gatepass_id, warden_name, remarks)
    if not success:
        return error_response(message=message, status_code=400)

    return success_response(message=message)

def check_out_gatepass(gatepass_id):
    user_id = g.current_user.get("user_id")
    user = AuthService.get_user_by_id(user_id)
    guard_name = user.get("fullName", "Security Guard") if user else "Security Guard"

    success, message = GatePassService.check_out_gatepass(gatepass_id, guard_name)
    if not success:
        return error_response(message=message, status_code=400)

    return success_response(message=message)

def check_in_gatepass(gatepass_id):
    user_id = g.current_user.get("user_id")
    user = AuthService.get_user_by_id(user_id)
    guard_name = user.get("fullName", "Security Guard") if user else "Security Guard"

    success, message = GatePassService.check_in_gatepass(gatepass_id, guard_name)
    if not success:
        return error_response(message=message, status_code=400)

    return success_response(message=message)

def list_gatepasses():
    status = request.args.get("status")
    search = request.args.get("search")
    student_id = request.args.get("studentId")

    results = GatePassService.list_gatepasses(status=status, search=search, student_id=student_id)
    return success_response(data=results, message="Gatepass list retrieved")

def get_gatepass_history():
    user_id = g.current_user.get("user_id")
    role = g.current_user.get("role")

    if role == "Student":
        results = GatePassService.list_gatepasses(student_id=user_id)
    else:
        results = GatePassService.list_gatepasses()

    return success_response(data=results, message="Gatepass history retrieved")
