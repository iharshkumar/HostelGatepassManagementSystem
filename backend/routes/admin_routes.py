from flask import Blueprint
from controllers.admin_controller import (
    get_dashboard_stats, list_users, update_user_role, delete_user,
    list_hostels, create_hostel
)
from middleware.auth import token_required
from middleware.roles import roles_required

admin_bp = Blueprint("admin", __name__)

admin_bp.route("/stats", methods=["GET"])(token_required(roles_required("Admin", "Warden")(get_dashboard_stats)))
admin_bp.route("/users", methods=["GET"])(token_required(roles_required("Admin")(list_users)))
admin_bp.route("/users/<user_id>/role", methods=["PUT"])(token_required(roles_required("Admin")(update_user_role)))
admin_bp.route("/users/<user_id>", methods=["DELETE"])(token_required(roles_required("Admin")(delete_user)))

admin_bp.route("/hostels", methods=["GET"])(token_required(roles_required("Admin", "Warden")(list_hostels)))
admin_bp.route("/hostels", methods=["POST"])(token_required(roles_required("Admin")(create_hostel)))
