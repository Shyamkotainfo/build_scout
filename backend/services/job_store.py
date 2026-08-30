import time
from datetime import datetime, timezone
from typing import Dict, Any, Optional

# In-memory store for active analysis jobs.
# Structure:
# {
#    "analysis_id": {
#        "status": "QUEUED|RUNNING|COMPLETED|FAILED",
#        "current_stage": "stage_name",
#        "error": "Error message if any",
#        "stages": {
#            "stage_name": {
#                "name": "stage_name",
#                "status": "PENDING|RUNNING|COMPLETED|FAILED",
#                "started_at": timestamp_str,
#                "completed_at": timestamp_str,
#                "duration_ms": int,
#                "_start_time_float": float
#            }
#        }
#    }
# }
ACTIVE_JOBS: Dict[str, Dict[str, Any]] = {}

def get_job(analysis_id: str) -> Optional[Dict[str, Any]]:
    return ACTIVE_JOBS.get(analysis_id)

def init_job(analysis_id: str) -> None:
    ACTIVE_JOBS[analysis_id] = {
        "status": "QUEUED",
        "current_stage": None,
        "error": None,
        "stages": {}
    }

def update_job_status(analysis_id: str, status: str, error: str = None) -> None:
    if analysis_id in ACTIVE_JOBS:
        ACTIVE_JOBS[analysis_id]["status"] = status
        if error:
            ACTIVE_JOBS[analysis_id]["error"] = error

def start_stage(analysis_id: str, stage_name: str) -> None:
    if analysis_id in ACTIVE_JOBS:
        ACTIVE_JOBS[analysis_id]["current_stage"] = stage_name
        if stage_name not in ACTIVE_JOBS[analysis_id]["stages"]:
            ACTIVE_JOBS[analysis_id]["stages"][stage_name] = {
                "name": stage_name,
                "status": "RUNNING",
                "started_at": datetime.now(timezone.utc).isoformat(),
                "completed_at": None,
                "duration_ms": None,
                "_start_time_float": time.time()
            }
        else:
            ACTIVE_JOBS[analysis_id]["stages"][stage_name]["status"] = "RUNNING"
            ACTIVE_JOBS[analysis_id]["stages"][stage_name]["started_at"] = datetime.now(timezone.utc).isoformat()
            ACTIVE_JOBS[analysis_id]["stages"][stage_name]["_start_time_float"] = time.time()

def complete_stage(analysis_id: str, stage_name: str, status: str = "COMPLETED") -> None:
    if analysis_id in ACTIVE_JOBS and stage_name in ACTIVE_JOBS[analysis_id]["stages"]:
        stage = ACTIVE_JOBS[analysis_id]["stages"][stage_name]
        stage["status"] = status
        stage["completed_at"] = datetime.now(timezone.utc).isoformat()
        if "_start_time_float" in stage and stage["_start_time_float"]:
            stage["duration_ms"] = int((time.time() - stage["_start_time_float"]) * 1000)

def build_status_response(analysis_id: str) -> Optional[Dict[str, Any]]:
    job = get_job(analysis_id)
    if not job:
        return None
    
    stages_list = list(job["stages"].values())
    
    return {
        "analysis_id": analysis_id,
        "status": job["status"],
        "current_stage": job["current_stage"],
        "error": job["error"],
        "stages": stages_list
    }
