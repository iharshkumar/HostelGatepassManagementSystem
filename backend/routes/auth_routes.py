from flask import Blueprint
from controllers.auth_controller import (
    register, login, logout, get_current_user,
    update_password, forgot_password_placeholder, reset_password_placeholder
)
from middleware.auth import token_required

auth_bp = Blueprint("auth", __name__)

auth_bp.route("/register", methods=["POST"])(register)
auth_bp.route("/login", methods=["POST"])(login)
auth_bp.route("/logout", methods=["POST"])(logout)
auth_bp.route("/me", methods=["GET"])(token_required(get_current_user))
auth_bp.route("/update-password", methods=["PUT"])(token_required(update_password))
auth_bp.route("/forgot-password", methods=["POST"])(forgot_password_placeholder)
auth_bp.route("/reset-password", methods=["POST"])(reset_password_placeholder)
