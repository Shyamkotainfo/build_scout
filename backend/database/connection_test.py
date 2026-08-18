import logging
import sys
from sqlalchemy import text
from config.settings import get_settings
from database.connection import _get_engine

# Temporarily disable verbose logging for the test output
logging.getLogger("sqlalchemy").setLevel(logging.WARNING)

def test_lakebase_connection():
    print("==================================================")
    print("LAKEBASE CONNECTION TEST")
    print("==================================================")
    print()

    settings = get_settings()
    
    # Mask password for safe display
    # Display the configuration attributes safely
    host = settings.lakebase_host if settings.lakebase_host else "None"
    port = settings.lakebase_port
    database = settings.lakebase_database if settings.lakebase_database else "None"
    user = settings.lakebase_user if settings.lakebase_user else "None"
    ssl_mode = settings.lakebase_ssl_mode
    
    print("Configuration:")
    print(f"Host: {host}")
    print(f"Port: {port}")
    print(f"Database: {database}")
    print(f"User: {user}")
    print(f"SSL: {ssl_mode}")
    print()

    if not host:
        print("Connection:")
        print("FAILED: No LAKEBASE_HOST configured in environment.")
        sys.exit(1)

    try:
        engine = _get_engine()
        with engine.connect() as conn:
            print("Connection:")
            print("SUCCESS")
            print()
            
            print("Query:")
            print("SELECT 1")
            print()
            
            result = conn.execute(text("SELECT 1")).scalar()
            
            print("Result:")
            print(result)
            print()
            print("==================================================")
    except Exception as e:
        print("Connection:")
        print("FAILED")
        print()
        print("Error:")
        print(f"{type(e).__name__}: {str(e)}")
        print()
        print("==================================================")
        sys.exit(1)

if __name__ == "__main__":
    test_lakebase_connection()
