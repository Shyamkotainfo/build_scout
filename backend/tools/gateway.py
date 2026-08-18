import abc
import time
import logging
from datetime import datetime, timezone
from typing import Dict, List, Any, Optional

# Import the actual tool functions
from tools.github import github_search, github_repository, get_package_metadata
from tools.web_search import search_web
from tools.license import get_license
from tools.security import get_security_posture
from tools.cloud_architecture import search_aws_documentation
from tools.documentation import search_documentation
from mcp_integration.manager import mcp_manager
from mcp_integration.registry import registry
from api.exceptions import MCPConfigurationException, MCPServiceException, MCPTimeoutException

logger = logging.getLogger("buildsmart.tools.gateway")

# --- Interface Definition ---
class BuildSmartTool(abc.ABC):
    """
    Abstract base class for all BuildSmart tools.
    """
    @property
    @abc.abstractmethod
    def name(self) -> str:
        """The tool identifier (e.g. 'github.search')"""
        pass

    @property
    @abc.abstractmethod
    def description(self) -> str:
        """Detailed description of what the tool does and its parameters."""
        pass

    @abc.abstractmethod
    async def execute(self, arguments: dict) -> dict:
        """Execute the tool logic and return structured JSON-serializable output."""
        pass

# --- Custom Python Tools ---

class GithubSearchTool(BuildSmartTool):
    @property
    def name(self) -> str:
        return "github.search"

    @property
    def description(self) -> str:
        return "Search GitHub repositories. Parameters: query (str), language (str, optional), limit (int, optional)"

    async def execute(self, arguments: dict) -> dict:
        query = arguments.get("query")
        if not query:
            raise ValueError("Parameter 'query' is required")
        language = arguments.get("language")
        limit = arguments.get("limit", 10)
        return await github_search(query, language=language, limit=limit)


class GithubRepositoryTool(BuildSmartTool):
    @property
    def name(self) -> str:
        return "github.repository"

    @property
    def description(self) -> str:
        return "Get details of a specific GitHub repository. Parameters: repository (str) e.g., 'owner/project'"

    async def execute(self, arguments: dict) -> dict:
        repository = arguments.get("repository")
        if not repository:
            raise ValueError("Parameter 'repository' is required")
        return await github_repository(repository)


class PackageMetadataTool(BuildSmartTool):
    @property
    def name(self) -> str:
        return "package.metadata"

    @property
    def description(self) -> str:
        return "Get metadata for a package from PyPI or NPM. Parameters: ecosystem (str), package (str), version (str, optional)"

    async def execute(self, arguments: dict) -> dict:
        ecosystem = arguments.get("ecosystem")
        package = arguments.get("package")
        if not ecosystem or not package:
            raise ValueError("Parameters 'ecosystem' and 'package' are required")
        version = arguments.get("version")
        return await get_package_metadata(ecosystem, package, version=version)


class WebSearchTool(BuildSmartTool):
    @property
    def name(self) -> str:
        return "web.search"

    @property
    def description(self) -> str:
        return "Search the public web for technical solutions or comparison. Parameters: query (str), limit (int, optional)"

    async def execute(self, arguments: dict) -> dict:
        query = arguments.get("query")
        if not query:
            raise ValueError("Parameter 'query' is required")
        limit = arguments.get("limit", 10)
        return await search_web(query, limit=limit)


class LicenseTool(BuildSmartTool):
    @property
    def name(self) -> str:
        return "license.get"

    @property
    def description(self) -> str:
        return "Get license and compliance info for a repository. Parameters: repository (str), version (str, optional)"

    async def execute(self, arguments: dict) -> dict:
        repository = arguments.get("repository")
        if not repository:
            raise ValueError("Parameter 'repository' is required")
        version = arguments.get("version")
        return await get_license(repository, version=version)


class SecurityTool(BuildSmartTool):
    @property
    def name(self) -> str:
        return "security.get"

    @property
    def description(self) -> str:
        return "Get security metrics and OpenSSF scorecard info for a repository. Parameters: repository (str)"

    async def execute(self, arguments: dict) -> dict:
        repository = arguments.get("repository")
        if not repository:
            raise ValueError("Parameter 'repository' is required")
        return await get_security_posture(repository)


class CloudArchitectureTool(BuildSmartTool):
    @property
    def name(self) -> str:
        return "cloud.architecture"

    @property
    def description(self) -> str:
        return "Search AWS reference architectures and documentation. Parameters: query (str)"

    async def execute(self, arguments: dict) -> dict:
        query = arguments.get("query")
        if not query:
            raise ValueError("Parameter 'query' is required")
        return await search_aws_documentation(query)


class DocsSearchTool(BuildSmartTool):
    @property
    def name(self) -> str:
        return "aws.documentation"

    @property
    def description(self) -> str:
        return "Search official documentation library guides. Parameters: query (str)"

    async def execute(self, arguments: dict) -> dict:
        query = arguments.get("query")
        if not query:
            raise ValueError("Parameter 'query' is required")
        return await search_documentation(query)


# --- Locally Managed State and Orchestration Tools ---

class CandidateRankingTool(BuildSmartTool):
    @property
    def name(self) -> str:
        return "candidate.rank"

    @property
    def description(self) -> str:
        return "Deterministic candidate ranking score. Parameters: component (str), candidates (list)"

    async def execute(self, arguments: dict) -> dict:
        """
        Rank candidates using standard score weighting:
        compatibility = 30%, health = 20%, security = 15%, license = 15%, adoption = 10%, maintenance = 10%
        """
        candidates = arguments.get("candidates", [])
        ranked = []
        for cand in candidates:
            scores = cand.get("scores", {})
            
            compatibility = float(scores.get("compatibility", 0))
            health = float(scores.get("health", 0))
            security = float(scores.get("security", 0))
            license_val = float(scores.get("license", 0))
            adoption = float(scores.get("adoption", 0))
            maintenance = float(scores.get("maintenance", 0))
            
            overall = (
                (compatibility * 0.30) +
                (health * 0.20) +
                (security * 0.15) +
                (license_val * 0.15) +
                (adoption * 0.10) +
                (maintenance * 0.10)
            )
            
            # Integration effort calculation heuristic
            integration = "LOW"
            if compatibility < 70 or health < 60:
                integration = "HIGH"
            elif compatibility < 85 or health < 80:
                integration = "MEDIUM"
                
            # Risk calculation heuristic
            risk = "LOW"
            if security < 60 or license_val < 50:
                risk = "CRITICAL"
            elif security < 75 or license_val < 80:
                risk = "MEDIUM"
                
            cand_copy = cand.copy()
            cand_copy["overall_score"] = round(overall, 1)
            cand_copy["integration_effort"] = integration
            cand_copy["risk_level"] = risk
            ranked.append(cand_copy)
            
        # Sort by overall score descending
        ranked.sort(key=lambda x: x["overall_score"], reverse=True)
        return {
            "component": arguments.get("component"),
            "ranked_candidates": [
                {
                    "candidate_id": c.get("id"),
                    "name": c.get("name"),
                    "rank_score": c["overall_score"],
                    "risk_level": c["risk_level"],
                    "integration_effort": c["integration_effort"]
                }
                for c in ranked
            ]
        }


# Global in-memory evidence store for fallback/demo use
_EVIDENCE_STORE: Dict[str, List[dict]] = {}

class EvidenceSaveTool(BuildSmartTool):
    @property
    def name(self) -> str:
        return "evidence.save"

    @property
    def description(self) -> str:
        return "Save gathered evidence for a candidate. Parameters: candidate_id (str), evidence_type (str), source_url (str), claim (str), evidence_text (str), confidence (float)"

    async def execute(self, arguments: dict) -> dict:
        cand_id = arguments.get("candidate_id")
        if not cand_id:
            raise ValueError("Parameter 'candidate_id' is required")
            
        evidence_item = {
            "type": arguments.get("evidence_type", "general"),
            "source_url": arguments.get("source_url", ""),
            "claim": arguments.get("claim", ""),
            "evidence": arguments.get("evidence_text", ""),
            "retrieved_at": datetime.now(timezone.utc).isoformat(),
            "confidence": float(arguments.get("confidence", 1.0))
        }
        
        if cand_id not in _EVIDENCE_STORE:
            _EVIDENCE_STORE[cand_id] = []
        _EVIDENCE_STORE[cand_id].append(evidence_item)
        return {"status": "saved", "candidate_id": cand_id}


class EvidenceGetTool(BuildSmartTool):
    @property
    def name(self) -> str:
        return "evidence.get"

    @property
    def description(self) -> str:
        return "Get saved evidence. Parameters: candidate_id (str)"

    async def execute(self, arguments: dict) -> dict:
        cand_id = arguments.get("candidate_id")
        if not cand_id:
            raise ValueError("Parameter 'candidate_id' is required")
        return {"evidence": _EVIDENCE_STORE.get(cand_id, [])}


# --- Unified Tool Gateway ---

class UnifiedToolGateway:
    """
    Unified Orchestrator that registers local custom tools and manages execution
    with metrics tracking, timeout control, and retries.
    It routes to external MCP servers if configured, and falls back to local tool adapters.
    """
    def __init__(self):
        self._tools: Dict[str, BuildSmartTool] = {}
        self._register_default_tools()
        
    def _register_default_tools(self):
        self.register_tool(GithubSearchTool())
        self.register_tool(GithubRepositoryTool())
        self.register_tool(PackageMetadataTool())
        self.register_tool(WebSearchTool())
        self.register_tool(LicenseTool())
        self.register_tool(SecurityTool())
        self.register_tool(CloudArchitectureTool())
        self.register_tool(DocsSearchTool())
        self.register_tool(CandidateRankingTool())
        self.register_tool(EvidenceSaveTool())
        self.register_tool(EvidenceGetTool())
        
    def register_tool(self, tool: BuildSmartTool):
        self._tools[tool.name] = tool
        logger.info(f"Registered tool: {tool.name}")
        
    def list_tools(self) -> List[Dict[str, str]]:
        return [
            {"name": t.name, "description": t.description}
            for t in self._tools.values()
        ]
        
    async def execute_tool(self, tool_name: str, arguments: dict, retries: int = 2) -> dict:
        """
        Execute tool by name. Routes to external MCPs or Local execution based on registry.
        Includes logging, metrics (latency), and retry handling for local tools.
        """
        try:
            tool_config = registry.get_tool_config(tool_name)
        except ValueError as e:
            logger.error(f"Tool {tool_name} not found in registry: {e}")
            return {
                "tool_name": tool_name,
                "status": "FAILED",
                "provider": "UNKNOWN",
                "latency_ms": 0,
                "error": {
                    "code": "TOOL_NOT_FOUND",
                    "message": f"Tool {tool_name} is not registered in the tool gateway."
                }
            }

        masked_args = mcp_manager._mask_secrets(arguments)
        
        # Argument Normalization
        mcp_args = {}
        if tool_config.provider == "MCP":
            if tool_name == "github.search":
                mcp_args = {"query": arguments.get("query", ""), "perPage": arguments.get("limit", 10)}
            elif tool_name == "web.search":
                mcp_args = {
                    "query": arguments.get("query", ""),
                    "search_depth": "advanced",
                    "max_results": arguments.get("limit", 10)
                }
            else:
                mcp_args = arguments.copy()

        # 1. External MCP Routing with Fallbacks
        if tool_config.provider == "MCP" and tool_config.mcp_server and tool_config.mcp_tool:
            try:
                logger.info(f"Routing {tool_name} to external MCP: {tool_config.mcp_server}.{tool_config.mcp_tool}")
                trace = await mcp_manager.call_tool(tool_config.mcp_server, tool_config.mcp_tool, mcp_args)
                if trace.get("status") == "SUCCESS":
                    return {
                        "tool_name": tool_name,
                        "status": "SUCCESS",
                        "latency_ms": trace.get("latency_ms", 0),
                        "provider": "MCP",
                        "source": tool_config.mcp_server,
                        "arguments": masked_args,
                        "results": [trace["result_summary"]["content"]]
                    }
            except Exception as e:
                logger.warning(f"External MCP failed for {tool_name}: {e}. Falling back to {tool_config.fallback_tool}.")
                if not tool_config.fallback_tool:
                    return {
                        "tool_name": tool_name,
                        "status": "FAILED",
                        "provider": "MCP",
                        "latency_ms": 0,
                        "arguments": masked_args,
                        "error": {"code": "MCP_FAILURE", "message": str(e)}
                    }
                # Update tool_name to fallback and fall through to local execution
                tool_name = tool_config.fallback_tool
                
        # 2. Local Execution (or Fallback execution)
        if tool_name not in self._tools:
            return {
                "tool_name": tool_name,
                "status": "FAILED",
                "provider": "LOCAL",
                "latency_ms": 0,
                "arguments": masked_args,
                "error": {"code": "LOCAL_TOOL_NOT_FOUND", "message": f"Local implementation for {tool_name} not found."}
            }

        tool = self._tools[tool_name]
        attempt = 0
        last_error = None
        
        while attempt <= retries:
            start_time = time.perf_counter()
            attempt += 1
            try:
                provider_type = "FALLBACK" if tool_config.provider == "MCP" else "LOCAL"
                logger.info(f"Executing {provider_type} tool {tool_name} (Attempt {attempt}) with arguments {masked_args}")
                result = await tool.execute(arguments)
                latency = int((time.perf_counter() - start_time) * 1000)
                
                # Result normalization for local tools
                normalized_results = []
                if isinstance(result, dict) and "results" in result:
                    normalized_results = result["results"]
                elif isinstance(result, dict) and "license" in result:
                    normalized_results = [result]
                elif isinstance(result, dict) and "security" in result:
                    normalized_results = [result]
                elif isinstance(result, list):
                    normalized_results = result
                else:
                    normalized_results = [result]
                    
                return {
                    "tool_name": tool_name,
                    "status": "SUCCESS",
                    "latency_ms": latency,
                    "provider": provider_type,
                    "source": "local",
                    "arguments": masked_args,
                    "results": normalized_results
                }
            except Exception as e:
                latency = int((time.perf_counter() - start_time) * 1000)
                logger.error(f"Error executing {tool_name} on attempt {attempt}: {e}")
                last_error = e
                # Wait briefly before retrying local tools
                time.sleep(0.1)
                
        return {
            "tool_name": tool_name,
            "status": "FAILED",
            "provider": "LOCAL",
            "latency_ms": latency,
            "arguments": masked_args,
            "error": {
                "code": "TOOL_EXECUTION_FAILED",
                "message": f"Failed after {attempt} attempts. Last error: {str(last_error)}"
            }
        }

# Global Singleton instance
tool_gateway = UnifiedToolGateway()
