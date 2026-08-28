import asyncio
import logging
from database.connection import init_db, get_session
from database.models import Analysis, AgentRun, LLMCall, ToolCall
import uuid

logging.basicConfig(level=logging.INFO)

def test_persistence():
    init_db()
    session_gen = get_session()
    session = next(session_gen)
    
    try:
        # Create Analysis
        analysis_id = uuid.uuid4()
        analysis = Analysis(
            id=analysis_id,
            user_request="Test Postgres Persistence",
            domain="TestDomain",
            status="TESTING"
        )
        session.add(analysis)
        
        # Create AgentRun
        run_id = uuid.uuid4()
        run = AgentRun(
            id=run_id,
            analysis_id=analysis_id,
            agent_name="TestAgent",
            status="SUCCESS",
            output={"key": "value"} # JSON
        )
        session.add(run)
        
        # Create ToolCall
        tool = ToolCall(
            agent_run_id=run_id,
            tool_name="github.search",
            arguments={"query": "test"}, # JSON
            result_summary={"res": "ok"} # JSON
        )
        session.add(tool)
        
        # Create LLMCall
        llm = LLMCall(
            analysis_id=analysis_id,
            agent_name="TestAgent",
            model="test-model",
            input_tokens=10,
            output_tokens=20,
            total_tokens=30,
            status="SUCCESS"
        )
        session.add(llm)
        
        session.commit()
        print(f"Created records successfully for analysis {analysis_id}")
        
        # Read back
        fetched = session.query(Analysis).filter_by(id=analysis_id).first()
        if fetched:
            print(f"Read Analysis: {fetched.user_request}")
            print(f"AgentRuns: {len(fetched.agent_runs)}")
            if fetched.agent_runs:
                r = fetched.agent_runs[0]
                print(f"AgentRun output (JSON): {r.output}")
                print(f"ToolCalls: {len(r.tool_calls)}")
                if r.tool_calls:
                    print(f"ToolCall args (JSON): {r.tool_calls[0].arguments}")
            print(f"LLMCalls: {len(fetched.llm_calls)}")
            
        # Delete test data
        session.delete(fetched)
        session.commit()
        print("Cleaned up test data.")
        
    except Exception as e:
        session.rollback()
        print(f"Persistence Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        try:
            next(session_gen)
        except StopIteration:
            pass

if __name__ == "__main__":
    test_persistence()
