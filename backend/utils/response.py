from flask import jsonify
from typing import Any, List, Dict, Tuple

def success_response(data: Any = None, message: str = "Success", status_code: int = 200) -> Tuple[Any, int]:
    payload = {
        "success": True,
        "message": message,
        "data": data if data is not None else {}
    }
    return jsonify(payload), status_code

def error_response(message: str = "Error occurred", errors: List[Any] | None = None, status_code: int = 400) -> Tuple[Any, int]:
    payload = {
        "success": False,
        "message": message,
        "errors": errors if errors is not None else []
    }
    return jsonify(payload), status_code
