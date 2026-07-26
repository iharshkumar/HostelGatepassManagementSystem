import os
import logging
from pymongo import MongoClient
from pymongo.database import Database
from config.settings import settings

logger = logging.getLogger(__name__)

_mongo_client = None
_db_instance = None

def _try_connect_mongo(uri: str) -> Database | None:
    try:
        if "example.mongodb.net" in uri or "<username>" in uri:
            logger.warning(f"Detected placeholder URI '{uri}'. Skipping direct connection.")
            return None

        client = MongoClient(uri, serverSelectionTimeoutMS=3000)
        # Test connection with ping
        client.admin.command('ping')
        
        db_name = "hostel_gatepass"
        if "/" in uri and uri.split("/")[-1]:
            raw_name = uri.split("/")[-1].split("?")[0]
            if raw_name:
                db_name = raw_name

        db = client[db_name]
        global _mongo_client
        _mongo_client = client
        logger.info(f"Successfully connected to MongoDB database: {db_name}")
        return db
    except Exception as e:
        logger.warning(f"Failed connecting to Mongo URI '{uri}': {e}")
        return None

def init_db(uri: str | None = None, is_test: bool = False) -> Database:
    global _mongo_client, _db_instance

    if _db_instance is not None:
        return _db_instance

    if is_test:
        try:
            import mongomock
            logger.info("Initializing in-memory mongomock database for testing...")
            _mongo_client = mongomock.MongoClient()
            _db_instance = _mongo_client["hostel_gatepass_test"]
            return _db_instance
        except Exception as e:
            logger.warning(f"mongomock init failed: {e}.")

    # Primary attempt: configured URI
    target_uri = uri or settings.MONGO_URI
    db = _try_connect_mongo(target_uri)
    if db is not None:
        _db_instance = db
        return _db_instance

    # Secondary attempt: local MongoDB fallback
    local_uri = "mongodb://127.0.0.1:27017/hostel_gatepass"
    if target_uri != local_uri:
        logger.info("Attempting fallback to local MongoDB instance (127.0.0.1:27017)...")
        db = _try_connect_mongo(local_uri)
        if db is not None:
            _db_instance = db
            return _db_instance

    # Tertiary fallback: in-memory mongomock for smooth local dev experience
    logger.warning("Could not connect to MongoDB Atlas or local Mongo instance. Initializing in-memory dev database fallback...")
    try:
        import mongomock
        _mongo_client = mongomock.MongoClient()
        _db_instance = _mongo_client["hostel_gatepass_dev"]
        logger.info("Initialized in-memory database fallback successfully.")
        return _db_instance
    except Exception as fallback_err:
        logger.error(f"In-memory fallback failed: {fallback_err}")
        raise RuntimeError("Unable to initialize any database connection (Atlas, Local, or Mock).") from fallback_err

def get_db() -> Database:
    global _db_instance
    if _db_instance is None:
        return init_db()
    return _db_instance

def close_db():
    global _mongo_client, _db_instance
    if _mongo_client:
        try:
            _mongo_client.close()
        except Exception:
            pass
        _mongo_client = None
        _db_instance = None
