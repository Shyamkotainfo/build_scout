import asyncio
import logging
from database.connection import init_db, get_session
from database.models import Analysis, AgentRun, LLMCall

logging.basicConfig(level=logging.INFO)

def test_metrics():
    init_db()
    session_gen = get_session()
    session = next(session_gen)
    
    try:
        # Fetch the real analysis
        analysis_id = "d61994d5-ff7c-47fc-8f78-a28c387b9264"
        
        runs = session.query(AgentRun).filter_by(analysis_id=analysis_id).all()
        for run in runs:
            runtime = "N/A"
            if run.completed_at and run.started_at:
                runtime = (run.completed_at - run.started_at).total_seconds()
            print(f"Agent: {run.agent_name} | Runtime: {runtime}s")
            
        print("\n--- LLM Metrics ---")
        llms = session.query(LLMCall).filter_by(analysis_id=analysis_id).all()
        total_in = sum(l.input_tokens for l in llms if l.input_tokens)
        total_out = sum(l.output_tokens for l in llms if l.output_tokens)
        total = sum(l.total_tokens for l in llms if l.total_tokens)
        print(f"Total LLM Calls: {len(llms)}")
        print(f"Total Input Tokens: {total_in}")
        print(f"Total Output Tokens: {total_out}")
        print(f"Total Tokens: {total}")
        
    except Exception as e:
        print(f"Error: {e}")
    finally:
        try:
            next(session_gen)
        except StopIteration:
            pass

if __name__ == "__main__":
    test_metrics()
