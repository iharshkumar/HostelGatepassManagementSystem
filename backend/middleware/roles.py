from functools import wraps
from flask import g
from utils.response import error_response

def roles_required(*allowed_roles):
    def decorator(f):
        @wraps(f)
        def decorated(*args, **kwargs):
            current_user = getattr(g, "current_user", None)
            if not current_user:
                return error_response("Unauthorized access", status_code=401)

            user_role = current_user.get("role")
            if user_role not in allowed_roles:
                return error_response(
                    f"Access forbidden. Requires role: {', '.join(allowed_roles)}", 
                    status_code=403
                )

            return f(*args, **kwargs)
        return decorated
    return decorator
