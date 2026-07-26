from flask import Blueprint
from controllers.gatepass_controller import (
    apply_gatepass, edit_gatepass, cancel_gatepass,
    approve_gatepass, reject_gatepass, check_out_gatepass, check_in_gatepass,
    list_gatepasses, get_gatepass_history
)
from middleware.auth import token_required
from middleware.roles import roles_required

gatepass_bp = Blueprint("gatepass", __name__)

# Student routes
gatepass_bp.route("/apply", methods=["POST"])(token_required(roles_required("Student")(apply_gatepass)))
gatepass_bp.route("/<gatepass_id>", methods=["PUT"])(token_required(roles_required("Student")(edit_gatepass)))
gatepass_bp.route("/<gatepass_id>/cancel", methods=["PUT"])(token_required(roles_required("Student")(cancel_gatepass)))

# Warden / Admin routes
gatepass_bp.route("/<gatepass_id>/approve", methods=["PUT"])(token_required(roles_required("Warden", "Admin")(approve_gatepass)))
gatepass_bp.route("/<gatepass_id>/reject", methods=["PUT"])(token_required(roles_required("Warden", "Admin")(reject_gatepass)))

# Security Guard / Admin routes
gatepass_bp.route("/<gatepass_id>/check-out", methods=["PUT"])(token_required(roles_required("Security Guard", "Admin")(check_out_gatepass)))
gatepass_bp.route("/<gatepass_id>/check-in", methods=["PUT"])(token_required(roles_required("Security Guard", "Admin")(check_in_gatepass)))

# Shared / Listing routes
gatepass_bp.route("", methods=["GET"])(token_required(list_gatepasses))
gatepass_bp.route("/history", methods=["GET"])(token_required(get_gatepass_history))
