from sqlalchemy import Column, String, Text, Numeric, Integer, Boolean, DateTime, ForeignKey, Float
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import declarative_base, relationship
import uuid
from datetime import datetime, timezone

Base = declarative_base()

def utcnow():
    return datetime.now(timezone.utc)

class Analysis(Base):
    __tablename__ = 'analysis'
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_request = Column(Text, nullable=False)
    normalized_request = Column(Text)
    domain = Column(String)
    status = Column(String)
    reuse_confidence = Column(Numeric)
    effort_from_scratch_days = Column(Numeric)
    effort_with_reuse_days = Column(Numeric)
    created_at = Column(DateTime(timezone=True), default=utcnow)
    updated_at = Column(DateTime(timezone=True), default=utcnow, onupdate=utcnow)

    requirements = relationship("Requirement", back_populates="analysis", cascade="all, delete-orphan")
    blueprints = relationship("Blueprint", back_populates="analysis", cascade="all, delete-orphan")
    agent_runs = relationship("AgentRun", back_populates="analysis", cascade="all, delete-orphan")


class Requirement(Base):
    __tablename__ = 'requirement'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey('analysis.id'), nullable=False, index=True)
    name = Column(String)
    description = Column(Text)
    category = Column(String)
    priority = Column(String)
    sequence = Column(Integer)

    analysis = relationship("Analysis", back_populates="requirements")
    components = relationship("Component", back_populates="requirement", cascade="all, delete-orphan")


class Component(Base):
    __tablename__ = 'component'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey('analysis.id'), nullable=True, index=True)
    requirement_id = Column(UUID(as_uuid=True), ForeignKey('requirement.id'), nullable=True, index=True)
    canonical_name = Column(String)
    component_type = Column(String)
    description = Column(Text)
    technical_role = Column(Text)

    requirement = relationship("Requirement", back_populates="components")
    candidates = relationship("Candidate", back_populates="component", cascade="all, delete-orphan")
    decisions = relationship("Decision", back_populates="component", cascade="all, delete-orphan")


class Source(Base):
    __tablename__ = 'source'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_type = Column(String)
    name = Column(String)
    base_url = Column(Text)
    trust_level = Column(String)
    enabled = Column(Boolean, default=True)

    candidates = relationship("Candidate", back_populates="source")


class Candidate(Base):
    __tablename__ = 'candidate'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    component_id = Column(UUID(as_uuid=True), ForeignKey('component.id'), nullable=False, index=True)
    source_id = Column(UUID(as_uuid=True), ForeignKey('source.id'), nullable=True, index=True)
    name = Column(String)
    url = Column(Text)
    repository_url = Column(Text)
    description = Column(Text)
    language = Column(String)
    stars = Column(Integer)
    forks = Column(Integer)
    open_issues = Column(Integer)
    last_commit_at = Column(DateTime(timezone=True))
    latest_release_at = Column(DateTime(timezone=True))
    license_name = Column(String)
    license_spdx = Column(String, index=True)
    metadata_ = Column("metadata", JSONB) # renamed attribute to avoid conflict with SQLAlchemy Base.metadata

    component = relationship("Component", back_populates="candidates")
    source = relationship("Source", back_populates="candidates")
    evaluations = relationship("CandidateEvaluation", back_populates="candidate", cascade="all, delete-orphan")


class CandidateEvaluation(Base):
    __tablename__ = 'candidate_evaluation'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidate.id'), nullable=False, index=True)
    compatibility_score = Column(Numeric)
    health_score = Column(Numeric)
    security_score = Column(Numeric)
    license_score = Column(Numeric)
    adoption_score = Column(Numeric)
    maintenance_score = Column(Numeric)
    overall_score = Column(Numeric)
    confidence_score = Column(Numeric)
    integration_effort = Column(String)
    risk_level = Column(String)
    rationale = Column(Text)

    candidate = relationship("Candidate", back_populates="evaluations")
    evidence = relationship("Evidence", back_populates="evaluation", cascade="all, delete-orphan")


class Evidence(Base):
    __tablename__ = 'evidence'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    evaluation_id = Column(UUID(as_uuid=True), ForeignKey('candidate_evaluation.id'), nullable=False)
    evidence_type = Column(String)
    source_url = Column(Text)
    source_title = Column(Text)
    claim = Column(Text)
    evidence_text = Column(Text)
    retrieved_at = Column(DateTime(timezone=True), default=utcnow)
    confidence = Column(Numeric)

    evaluation = relationship("CandidateEvaluation", back_populates="evidence")


class Decision(Base):
    __tablename__ = 'decision'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    component_id = Column(UUID(as_uuid=True), ForeignKey('component.id'), nullable=False, index=True)
    candidate_id = Column(UUID(as_uuid=True), ForeignKey('candidate.id'), nullable=True) # BUILD has no candidate
    decision = Column(String)
    confidence = Column(Numeric)
    risk_level = Column(String)
    integration_effort = Column(String)
    rationale = Column(Text)

    component = relationship("Component", back_populates="decisions")


class Blueprint(Base):
    __tablename__ = 'blueprint'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey('analysis.id'), nullable=False)
    architecture = Column(JSONB)
    component_mapping = Column(JSONB)
    integration_flow = Column(JSONB)
    data_flow = Column(JSONB)
    api_interfaces = Column(JSONB)
    technology_stack = Column(JSONB)
    implementation_phases = Column(JSONB)
    estimated_effort_days = Column(Numeric)

    analysis = relationship("Analysis", back_populates="blueprints")


class AgentRun(Base):
    __tablename__ = 'agent_run'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(UUID(as_uuid=True), ForeignKey('analysis.id'), nullable=False, index=True)
    parent_run_id = Column(UUID(as_uuid=True), ForeignKey('agent_run.id'), nullable=True)
    agent_name = Column(String)
    status = Column(String)
    input_summary = Column(Text)
    output = Column(JSONB)
    tool_call_count = Column(Integer)
    retry_count = Column(Integer)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))

    analysis = relationship("Analysis", back_populates="agent_runs")
    tool_calls = relationship("ToolCall", back_populates="agent_run", cascade="all, delete-orphan")


class ToolCall(Base):
    __tablename__ = 'tool_call'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_run_id = Column(UUID(as_uuid=True), ForeignKey('agent_run.id'), nullable=False, index=True)
    tool_name = Column(String)
    tool_type = Column(String)
    arguments = Column(JSONB)
    result_summary = Column(JSONB)
    status = Column(String)
    latency_ms = Column(Integer)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))

    agent_run = relationship("AgentRun", back_populates="tool_calls")


class AgentMessage(Base):
    __tablename__ = 'agent_message'

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    agent_run_id = Column(UUID(as_uuid=True), ForeignKey('agent_run.id'), nullable=False)
    target_agent = Column(String)
    message_type = Column(String)
    payload = Column(JSONB)
    created_at = Column(DateTime(timezone=True), default=utcnow)
