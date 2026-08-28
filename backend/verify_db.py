from database.connection import init_db, get_session
import logging

logging.basicConfig(level=logging.INFO)

def test_db():
    try:
        init_db()
        # Verify session can be created
        session = next(get_session())
        print("Successfully connected and initialized the database.")
    except Exception as e:
        print(f"Database Error: {e}")

if __name__ == "__main__":
    test_db()
