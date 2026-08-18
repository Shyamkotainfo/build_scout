from pydantic import BaseModel, Field, constr
from typing import List, Dict, Any, Optional

class AnalysisRequest(BaseModel):
    user_request: constr(strip_whitespace=True, min_length=1, max_length=5000)

class AnalysisResponse(BaseModel):
    analysis_id: str
    status: str
    message: str

class RequirementResponse(BaseModel):
    id: str
    description: str
    priority: str

class ComponentResponse(BaseModel):
    id: str
    name: str
    category: str
    description: str
    dependencies: List[str] = Field(default_factory=list)

class CandidateResponse(BaseModel):
    component_id: str
    name: str
    url: Optional[str] = None
    description: str
    license: str
    stars: int

class EvaluationResponse(BaseModel):
    candidate_name: str
    component_id: str
    score: int
    reasoning: str
    concerns: List[str] = Field(default_factory=list)
    missing_evidence: List[str] = Field(default_factory=list)

class DecisionResponse(BaseModel):
    component_id: str
    decision: str
    selected_candidate_name: Optional[str] = None
    confidence: float
    reason: str
    risks: List[str] = Field(default_factory=list)
    implementation_notes: List[str] = Field(default_factory=list)

class BlueprintComponentResponse(BaseModel):
    component_id: str
    component_name: str
    decision: str
    technology: str
    responsibility: str
    integration: str

class ReuseSummaryResponse(BaseModel):
    REUSE: List[str] = Field(default_factory=list)
    ADAPT: List[str] = Field(default_factory=list)
    BUILD: List[str] = Field(default_factory=list)

class ErrorDetail(BaseModel):
    code: str
    message: str
    details: Optional[Dict[str, Any]] = None
    analysis_id: Optional[str] = None

class ErrorResponse(BaseModel):
    error: ErrorDetail

class BlueprintResponse(BaseModel):
    solution_summary: str = ""
    architecture_style: str = ""
    components: List[BlueprintComponentResponse] = Field(default_factory=list)
    reuse_summary: Optional[ReuseSummaryResponse] = None
    data_flow: List[str] = Field(default_factory=list)
    integration_points: List[Dict[str, Any]] = Field(default_factory=list)
    implementation_phases: List[Dict[str, Any]] = Field(default_factory=list)
    assumptions: List[str] = Field(default_factory=list)
    risks: List[str] = Field(default_factory=list)

class ValidationCategoryResponse(BaseModel):
    status: str = "UNKNOWN"
    score: int = 0
    findings: List[str] = Field(default_factory=list)

class ValidationResponse(BaseModel):
    overall_status: str = "UNKNOWN"
    overall_score: int = 0
    requirement_coverage: Optional[ValidationCategoryResponse] = None
    component_coverage: Optional[ValidationCategoryResponse] = None
    decision_consistency: Optional[ValidationCategoryResponse] = None
    architecture_consistency: Optional[ValidationCategoryResponse] = None
    data_flow_consistency: Optional[ValidationCategoryResponse] = None
    integration_consistency: Optional[ValidationCategoryResponse] = None
    implementation_completeness: Optional[ValidationCategoryResponse] = None
    risk_completeness: Optional[ValidationCategoryResponse] = None
    critical_issues: List[str] = Field(default_factory=list)
    warnings: List[str] = Field(default_factory=list)
    recommendations: List[str] = Field(default_factory=list)

class AgentTraceResponse(BaseModel):
    agent_name: str
    status: str
    execution_order: int
    tool_calls: List[Dict[str, Any]] = Field(default_factory=list)

class LLMMetricsResponse(BaseModel):
    total_calls: int = 0
    successful_calls: int = 0
    failed_calls: int = 0
    total_retries: int = 0
    total_input_tokens: int = 0
    total_output_tokens: int = 0
    total_tokens: int = 0
    total_latency_ms: int = 0
    average_latency_ms: int = 0
    context_compactions: int = 0
    total_cost: Optional[float] = None

class AnalysisResultResponse(BaseModel):
    analysis_id: str
    user_request: str
    normalized_request: str = ""
    domain: str = ""
    status: str
    requirements: List[RequirementResponse] = Field(default_factory=list)
    components: List[ComponentResponse] = Field(default_factory=list)
    candidates: List[CandidateResponse] = Field(default_factory=list)
    evaluations: List[EvaluationResponse] = Field(default_factory=list)
    decisions: List[DecisionResponse] = Field(default_factory=list)
    blueprint: Optional[BlueprintResponse] = Field(default_factory=BlueprintResponse)
    validation_result: Optional[ValidationResponse] = Field(default_factory=ValidationResponse)
    agent_history: List[str] = Field(default_factory=list)
    traces: List[AgentTraceResponse] = Field(default_factory=list)
    llm_metrics: Optional[LLMMetricsResponse] = None
