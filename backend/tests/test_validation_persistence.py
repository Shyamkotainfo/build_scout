import uuid
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.models import Base
from database.connection import migrate_existing_schema
from database.repositories import AnalysisRepository

def test_validation_persistence():
    # 1. Setup in-memory SQLite DB
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)
    
    # Run migration to ensure it doesn't crash on existing or new tables
    migrate_existing_schema(engine)
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    
    repo = AnalysisRepository()
    analysis_id = str(uuid.uuid4())
    
    # 2. Mock state simulating ValidationAgent output
    state = {
        "analysis_id": analysis_id,
        "user_request": "Test request",
        "status": "COMPLETED",
        "validation_result": {
            "overall_score": 85,
            "overall_status": "WARNING",
            "critical_issues": ["Issue 1"],
            "requirement_coverage": {
                "score": 100,
                "status": "PASS",
                "findings": []
            }
        }
    }
    
    # 3. Save analysis
    try:
        repo.save_analysis(session, state)
        session.commit()
    except Exception as e:
        session.rollback()
        raise e
        
    # 4. Verify DB columns directly
    analyses = repo.get_all_analyses(session)
    assert len(analyses) == 1
    a = analyses[0]
    assert a.validation_score == 85
    assert a.validation_status == "WARNING"
    assert a.validation_result["critical_issues"] == ["Issue 1"]
    
    # 5. Verify get_analysis_result (Detail API endpoint)
    result = repo.get_analysis_result(session, uuid.UUID(analysis_id))
    assert result is not None
    assert result["validation_result"]["overall_score"] == 85
    assert result["validation_result"]["overall_status"] == "WARNING"
    assert result["validation_result"]["requirement_coverage"]["score"] == 100
    
    session.close()
