import os
import logging
from flask import Flask
from flask_cors import CORS
from config.settings import settings
from config.database import init_db
from middleware.error_handler import register_error_handlers
from routes.auth_routes import auth_bp
from routes.student_routes import student_bp
from routes.gatepass_routes import gatepass_bp
from routes.admin_routes import admin_bp

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("HostelGatepassBackend")

def create_app(test_config=None) -> Flask:
    app = Flask(__name__)
    app.config["SECRET_KEY"] = settings.SECRET_KEY

    # Enable CORS for frontend integration
    CORS(app, resources={r"/api/*": {"origins": "*"}}, supports_credentials=True)

    # Database initialization
    if test_config and test_config.get("TESTING"):
        init_db(is_test=True)
    else:
        try:
            init_db()
        except Exception as e:
            logger.warning(f"Could not connect to MongoDB Atlas at startup: {e}")

    # Register Blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(student_bp, url_prefix="/api/student")
    app.register_blueprint(gatepass_bp, url_prefix="/api/gatepass")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")

    # Global Error Handling
    register_error_handlers(app)

    # Security Headers (Helmet Equivalent)
    @app.after_request
    def set_security_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        return response

    @app.route("/health", methods=["GET"])
    def health_check():
        return {"status": "healthy", "environment": settings.ENVIRONMENT}, 200

    return app

app = create_app()

if __name__ == "__main__":
    logger.info(f"Starting server on port {settings.PORT}...")
    app.run(host="0.0.0.0", port=settings.PORT, debug=settings.IS_DEV)
