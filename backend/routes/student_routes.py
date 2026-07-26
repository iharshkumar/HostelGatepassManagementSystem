from flask import Blueprint
from controllers.student_controller import get_student_profile, update_student_profile, get_own_gatepasses
from middleware.auth import token_required
from middleware.roles import roles_required

student_bp = Blueprint("student", __name__)

student_bp.route("/profile", methods=["GET"])(token_required(roles_required("Student")(get_student_profile)))
student_bp.route("/profile", methods=["PUT"])(token_required(roles_required("Student")(update_student_profile)))
student_bp.route("/gatepasses", methods=["GET"])(token_required(roles_required("Student")(get_own_gatepasses)))
