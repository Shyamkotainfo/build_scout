import sys
import os

# Add backend directory to sys.path so we can import from database and models
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.connection import get_session
from database.models import (
    Analysis,
    Requirement,
    Component,
    Candidate,
    CandidateEvaluation,
    Evidence,
    Decision,
    Blueprint,
    AgentRun,
    ToolCall,
    AgentMessage,
    LLMCall
)

def reset_database():
    session_gen = get_session()
    session = next(session_gen)
    try:
        print("Starting database reset (analysis data only)...")

        models_to_delete = [
            (Evidence, 'Evidence'),
            (CandidateEvaluation, 'CandidateEvaluation'),
            (Decision, 'Decision'),
            (Candidate, 'Candidate'),
            (Component, 'Component'),
            (Requirement, 'Requirement'),
            (Blueprint, 'Blueprint'),
            (ToolCall, 'ToolCall'),
            (AgentMessage, 'AgentMessage'),
            (AgentRun, 'AgentRun'),
            (LLMCall, 'LLMCall'),
            (Analysis, 'Analysis')
        ]

        for model, name in models_to_delete:
            deleted_count = session.query(model).delete(synchronize_session=False)
            print(f"Deleted {deleted_count} rows from {name}")

        session.commit()
        print("Database reset successfully committed.")
        
        # Verify Analysis count
        analysis_count = session.query(Analysis).count()
        print(f"Verification: Analysis count is now {analysis_count}")
        if analysis_count != 0:
            print("ERROR: Database reset failed to clear all analyses.")
            sys.exit(1)

    except Exception as e:
        session.rollback()
        print(f"Error during database reset: {e}")
        sys.exit(1)
    finally:
        try:
            session.close()
        except:
            pass

if __name__ == "__main__":
    reset_database()
