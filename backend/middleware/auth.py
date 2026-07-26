from functools import wraps
from flask import request, g
from utils.helpers import decode_jwt_token
from utils.response import error_response

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return error_response("Authentication token is missing", status_code=401)

        parts = auth_header.split(" ")
        if len(parts) != 2 or parts[0].lower() != "bearer":
            return error_response("Invalid Authorization header format. Expected 'Bearer <token>'", status_code=401)

        token = parts[1]
        try:
            payload = decode_jwt_token(token)
            g.current_user = payload
        except ValueError as e:
            return error_response(str(e), status_code=401)
        except Exception as e:
            return error_response("Authentication failed", status_code=401)

        return f(*args, **kwargs)
    return decorated
