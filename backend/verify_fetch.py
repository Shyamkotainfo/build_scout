import asyncio
import logging
from database.connection import init_db, get_session
from database.models import Analysis, AgentRun, LLMCall, ToolCall

logging.basicConfig(level=logging.INFO)

def test_fetch():
    init_db()
    session_gen = get_session()
    session = next(session_gen)
    
    try:
        # We fetch the specific analysis ID from the successful E2E run
        analysis_id = "d61994d5-ff7c-47fc-8f78-a28c387b9264"
        fetched = session.query(Analysis).filter_by(id=analysis_id).first()
        if fetched:
            print(f"FOUND ANALYSIS: {fetched.id}")
            print(f"Status: {fetched.status}")
            print(f"AgentRuns Count: {len(fetched.agent_runs)}")
            print(f"LLMCalls Count: {len(fetched.llm_calls)}")
            
            tool_calls = session.query(ToolCall).join(AgentRun).filter(AgentRun.analysis_id == analysis_id).count()
            print(f"ToolCalls Count: {tool_calls}")
            
            # Relationships
            print(f"Requirements Count: {len(fetched.requirements)}")
            if fetched.requirements:
                print(f"Components in Req 0: {len(fetched.requirements[0].components)}")
            print(f"Blueprints Count: {len(fetched.blueprints)}")
        else:
            print("ANALYSIS NOT FOUND")
            
    except Exception as e:
        print(f"Fetch Error: {e}")
    finally:
        try:
            next(session_gen)
        except StopIteration:
            pass

if __name__ == "__main__":
    test_fetch()
