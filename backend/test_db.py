import json
from database.connection import get_session
from database.models import Analysis

session = next(get_session())
record = session.query(Analysis).filter(Analysis.analysis_id == 'b66f09af-a7e4-4669-8748-2da8640f640b').first()
if record:
    print(json.dumps(record.evaluations, indent=2))
else:
    print("Record not found")
