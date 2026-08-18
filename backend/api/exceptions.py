from typing import Optional

class BuildSmartAPIException(Exception):
    """Base class for all BuildSmart API exceptions."""
    def __init__(self, code: str, message: str, status_code: int = 500, analysis_id: Optional[str] = None):
        self.code = code
        self.message = message
        self.status_code = status_code
        self.analysis_id = analysis_id
        super().__init__(self.message)

class AnalysisExecutionException(BuildSmartAPIException):
    """Raised when the LangGraph workflow unexpectedly fails."""
    def __init__(self, message: str = "Unable to complete the analysis.", analysis_id: Optional[str] = None):
        super().__init__("ANALYSIS_EXECUTION_FAILED", message, 500, analysis_id)

class LLMServiceException(BuildSmartAPIException):
    """Raised when the LLM provider (e.g. Groq) is unavailable or rate limited."""
    def __init__(self, message: str = "The AI service is temporarily unavailable. Please try again later.", analysis_id: Optional[str] = None):
        super().__init__("LLM_SERVICE_UNAVAILABLE", message, 503, analysis_id)

class MCPServiceException(BuildSmartAPIException):
    """Raised when an MCP-related failure reaches the API boundary."""
    def __init__(self, message: str = "A required external service is temporarily unavailable.", analysis_id: Optional[str] = None):
        super().__init__("MCP_SERVICE_UNAVAILABLE", message, 503, analysis_id)

class MCPTimeoutException(MCPServiceException):
    """Raised when an MCP tool call exceeds the configured timeout."""
    def __init__(self, message: str = "The external service timed out.", analysis_id: Optional[str] = None):
        super().__init__(message, analysis_id)
        self.code = "MCP_TIMEOUT"

class MCPConfigurationException(MCPServiceException):
    """Raised when an MCP server or tool is not allowed by configuration."""
    def __init__(self, message: str = "The requested tool or server is not configured.", analysis_id: Optional[str] = None):
        super().__init__(message, analysis_id)
        self.code = "MCP_CONFIGURATION_ERROR"
        self.status_code = 500

class AnalysisNotFoundException(BuildSmartAPIException):
    """Raised when an analysis_id does not exist in Lakebase."""
    def __init__(self, analysis_id: str):
        super().__init__(
            code="ANALYSIS_NOT_FOUND",
            message=f"Analysis with the specified ID was not found.",
            status_code=404,
            analysis_id=analysis_id
        )
