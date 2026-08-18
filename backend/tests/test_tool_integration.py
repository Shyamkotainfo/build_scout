import pytest
from tools.gateway import tool_gateway

@pytest.mark.asyncio
async def test_security_tool_integration():
    args = {"query": "django/django", "repository": "django/django"}
    result = await tool_gateway.execute_tool("security.get", args)
    
    assert result["status"] == "SUCCESS"
    assert result["provider"] == "LOCAL"
    assert "results" in result
    assert isinstance(result["results"], list)

@pytest.mark.asyncio
async def test_license_tool_integration():
    args = {"query": "django/django", "repository": "django/django"}
    result = await tool_gateway.execute_tool("license.get", args)
    
    assert result["status"] == "SUCCESS"
    assert result["provider"] == "LOCAL"
    assert "results" in result
    assert isinstance(result["results"], list)

@pytest.mark.asyncio
async def test_documentation_tool_integration():
    args = {"query": "pymupdf"}
    result = await tool_gateway.execute_tool("aws.documentation", args)
    
    # Actually aws.documentation uses cloud_architecture tool.
    assert result["status"] == "SUCCESS"
    assert result["provider"] == "LOCAL"
    assert "results" in result
    assert isinstance(result["results"], list)

@pytest.mark.asyncio
async def test_cloud_architecture_tool_integration():
    args = {"query": "document"}
    result = await tool_gateway.execute_tool("cloud.architecture", args)
    
    assert result["status"] == "SUCCESS"
    assert result["provider"] == "LOCAL"
    assert "results" in result
    assert isinstance(result["results"], list)
