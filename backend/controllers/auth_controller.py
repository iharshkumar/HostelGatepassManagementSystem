from flask import request, g
from services.auth_service import AuthService
from utils.validators import validate_register_input, validate_login_input
from utils.response import success_response, error_response
from schemas.auth_schema import RegisterSchema, LoginSchema

def register():
    data = request.get_json() or {}
    is_valid, errors = validate_register_input(data)
    if not is_valid:
        return error_response(message="Validation failed", errors=errors, status_code=400)

    schema = RegisterSchema(data)
    success, message, result = AuthService.register_user(data)
    if not success:
        return error_response(message=message, status_code=400)

    return success_response(data=result, message=message, status_code=201)

def login():
    data = request.get_json() or {}
    is_valid, errors = validate_login_input(data)
    if not is_valid:
        return error_response(message="Validation failed", errors=errors, status_code=400)

    success, message, result = AuthService.login_user(data)
    if not success:
        return error_response(message=message, status_code=401)

    return success_response(data=result, message=message, status_code=200)

def logout():
    # Client invalidates JWT locally
    return success_response(message="Successfully logged out", status_code=200)

def get_current_user():
    user_id = g.current_user.get("user_id")
    user = AuthService.get_user_by_id(user_id)
    if not user:
        return error_response(message="User not found", status_code=404)
    return success_response(data=user, message="Current user profile retrieved")

def update_password():
    data = request.get_json() or {}
    old_pass = data.get("oldPassword", "")
    new_pass = data.get("newPassword", "")

    if not old_pass or not new_pass:
        return error_response("Both oldPassword and newPassword are required", status_code=400)

    if len(new_pass) < 6:
        return error_response("New password must be at least 6 characters", status_code=400)

    user_id = g.current_user.get("user_id")
    success, message = AuthService.update_password(user_id, old_pass, new_pass)
    if not success:
        return error_response(message=message, status_code=400)

    return success_response(message=message)

def forgot_password_placeholder():
    return success_response(message="Password reset link sent to your email (placeholder endpoint)")

def reset_password_placeholder():
    return success_response(message="Password successfully reset (placeholder endpoint)")
