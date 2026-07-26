import logging
from flask import Flask, jsonify
from utils.response import error_response
from config.settings import settings

logger = logging.getLogger(__name__)

def register_error_handlers(app: Flask):

    @app.errorhandler(404)
    def handle_404(e):
        return error_response("Requested API endpoint not found", status_code=404)

    @app.errorhandler(405)
    def handle_405(e):
        return error_response("HTTP method not allowed for this route", status_code=405)

    @app.errorhandler(Exception)
    def handle_global_exception(e):
        logger.exception(f"Unhandled Exception: {str(e)}")
        message = str(e) if settings.IS_DEV else "Internal Server Error"
        return error_response(message=message, status_code=500)
