import pytest
import sys
import os

# Ensure backend root is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app
from config.database import get_db

@pytest.fixture
def app():
    flask_app = create_app({"TESTING": True})
    yield flask_app

@pytest.fixture(autouse=True)
def clean_db(app):
    with app.app_context():
        db = get_db()
        for col_name in db.list_collection_names():
            db[col_name].delete_many({})

@pytest.fixture
def client(app):
    return app.test_client()

@pytest.fixture
def runner(app):
    return app.test_cli_runner()
