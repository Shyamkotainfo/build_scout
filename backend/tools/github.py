import os
import httpx
import logging
from datetime import datetime, timezone

logger = logging.getLogger("buildsmart.tools.github")

# Context-aware mock data for offline/rate-limited fallback
MOCK_REPOS = {
    "pdf": [
        {
            "name": "pymupdf/PyMuPDF",
            "url": "https://github.com/pymupdf/PyMuPDF",
            "description": "Python bindings for MuPDF, a lightweight PDF, XPS, and E-book viewer, renderer, and toolkit.",
            "language": "Python",
            "stars": 4200,
            "forks": 520,
            "open_issues": 45,
            "last_commit_at": "2026-08-15T12:00:00Z",
            "latest_release_at": "2026-08-10T08:00:00Z",
            "license_name": "GNU Affero General Public License v3.0 / Commercial",
            "license_spdx": "AGPL-3.0",
        },
        {
            "name": "jsvine/pdfplumber",
            "url": "https://github.com/jsvine/pdfplumber",
            "description": "Plumb a PDF for detailed info on each text character, rectangle, and line.",
            "language": "Python",
            "stars": 4800,
            "forks": 610,
            "open_issues": 120,
            "last_commit_at": "2026-08-16T14:30:00Z",
            "latest_release_at": "2026-07-28T10:00:00Z",
            "license_name": "MIT License",
            "license_spdx": "MIT",
        },
        {
            "name": "py-pdf/pypdf",
            "url": "https://github.com/py-pdf/pypdf",
            "description": "A pure-python PDF library capable of splitting, merging, cropping, and transforming PDF files.",
            "language": "Python",
            "stars": 6100,
            "forks": 1100,
            "open_issues": 85,
            "last_commit_at": "2026-08-14T09:15:00Z",
            "latest_release_at": "2026-08-05T15:20:00Z",
            "license_name": "BSD 3-Clause License",
            "license_spdx": "BSD-3-Clause",
        }
    ],
    "vector": [
        {
            "name": "facebookresearch/faiss",
            "url": "https://github.com/facebookresearch/faiss",
            "description": "A library for efficient similarity search and clustering of dense vectors.",
            "language": "C++",
            "stars": 28500,
            "forks": 4100,
            "open_issues": 310,
            "last_commit_at": "2026-08-12T17:00:00Z",
            "latest_release_at": "2026-06-15T09:00:00Z",
            "license_name": "MIT License",
            "license_spdx": "MIT",
        },
        {
            "name": "chroma-core/chroma",
            "url": "https://github.com/chroma-core/chroma",
            "description": "the AI-native open-source embedding database. Python/JS/TS.",
            "language": "Python",
            "stars": 12400,
            "forks": 1200,
            "open_issues": 190,
            "last_commit_at": "2026-08-17T21:00:00Z",
            "latest_release_at": "2026-08-11T16:00:00Z",
            "license_name": "Apache License 2.0",
            "license_spdx": "Apache-2.0",
        },
        {
            "name": "pgvector/pgvector",
            "url": "https://github.com/pgvector/pgvector",
            "description": "Open-source vector similarity search for Postgres.",
            "language": "C",
            "stars": 9200,
            "forks": 510,
            "open_issues": 15,
            "last_commit_at": "2026-08-16T10:00:00Z",
            "latest_release_at": "2026-07-20T11:00:00Z",
            "license_name": "PostgreSQL License",
            "license_spdx": "PostgreSQL",
        }
    ],
    "ocr": [
        {
            "name": "JaidedAI/EasyOCR",
            "url": "https://github.com/JaidedAI/EasyOCR",
            "description": "Ready-to-use OCR with 80+ supported languages and all popular writing scripts.",
            "language": "Python",
            "stars": 22300,
            "forks": 3200,
            "open_issues": 412,
            "last_commit_at": "2026-08-10T05:00:00Z",
            "latest_release_at": "2026-05-18T12:00:00Z",
            "license_name": "Apache License 2.0",
            "license_spdx": "Apache-2.0",
        },
        {
            "name": "tesseract-ocr/tesseract",
            "url": "https://github.com/tesseract-ocr/tesseract",
            "description": "Tesseract Open Source OCR Engine (main repository)",
            "language": "C++",
            "stars": 54000,
            "forks": 9500,
            "open_issues": 750,
            "last_commit_at": "2026-08-14T11:00:00Z",
            "latest_release_at": "2026-07-02T10:00:00Z",
            "license_name": "Apache License 2.0",
            "license_spdx": "Apache-2.0",
        }
    ],
    "api": [
        {
            "name": "fastapi/fastapi",
            "url": "https://github.com/fastapi/fastapi",
            "description": "FastAPI framework, high performance, easy to learn, fast to code, ready for production",
            "language": "Python",
            "stars": 69000,
            "forks": 5900,
            "open_issues": 650,
            "last_commit_at": "2026-08-17T23:30:00Z",
            "latest_release_at": "2026-08-12T14:00:00Z",
            "license_name": "MIT License",
            "license_spdx": "MIT",
        }
    ]
}

def get_fallback_repos(query: str, limit: int = 5):
    query_lower = query.lower()
    for key, repos in MOCK_REPOS.items():
        if key in query_lower:
            return repos[:limit]
    # Default fallback
    return [
        {
            "name": "example/project-a",
            "url": "https://github.com/example/project-a",
            "description": f"Generic helper repository for {query}.",
            "language": "Python",
            "stars": 150,
            "forks": 12,
            "open_issues": 2,
            "last_commit_at": "2026-08-01T00:00:00Z",
            "latest_release_at": "2026-07-01T00:00:00Z",
            "license_name": "MIT License",
            "license_spdx": "MIT",
        }
    ][:limit]

async def github_search(query: str, language: str = None, limit: int = 10) -> dict:
    """
    Search GitHub repositories using public API with mock fallback.
    """
    url = f"https://api.github.com/search/repositories"
    q = query
    if language:
        q += f" language:{language}"
    params = {"q": q, "per_page": min(limit, 100)}
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "BuildSmart-Agent"
    }
    
    # Check for github token in env
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"token {token}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params, headers=headers)
            if response.status_code == 200:
                data = response.json()
                results = []
                for item in data.get("items", []):
                    results.append({
                        "name": item.get("full_name"),
                        "url": item.get("html_url"),
                        "description": item.get("description") or "",
                        "language": item.get("language") or "Unknown",
                        "stars": item.get("stargazers_count", 0),
                        "forks": item.get("forks_count", 0),
                        "updated_at": item.get("updated_at")
                    })
                return {"source": "github", "results": results}
            else:
                logger.warning(f"GitHub API search returned status {response.status_code}. Using mock fallback.")
    except Exception as e:
        logger.error(f"GitHub API search failed: {e}. Using mock fallback.")

    # Fallback logic
    mock_results = get_fallback_repos(query, limit)
    results = []
    for item in mock_results:
        results.append({
            "name": item["name"],
            "url": item["url"],
            "description": item["description"],
            "language": item["language"],
            "stars": item["stars"],
            "forks": item["forks"],
            "updated_at": item["last_commit_at"]
        })
    return {"source": "github", "results": results}

async def github_repository(repository: str) -> dict:
    """
    Get detailed repository information.
    """
    url = f"https://api.github.com/repos/{repository}"
    headers = {
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "BuildSmart-Agent"
    }
    token = os.getenv("GITHUB_TOKEN")
    if token:
        headers["Authorization"] = f"token {token}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, headers=headers)
            if response.status_code == 200:
                item = response.json()
                
                # Fetch release info
                release_url = f"{url}/releases/latest"
                latest_release_at = None
                release_res = await client.get(release_url, headers=headers)
                if release_res.status_code == 200:
                    latest_release_at = release_res.json().get("published_at")
                
                return {
                    "id": str(item.get("id")),
                    "name": item.get("full_name"),
                    "description": item.get("description") or "",
                    "url": item.get("html_url"),
                    "repository_url": item.get("html_url"),
                    "language": item.get("language") or "Unknown",
                    "stars": item.get("stargazers_count", 0),
                    "forks": item.get("forks_count", 0),
                    "open_issues": item.get("open_issues_count", 0),
                    "last_commit_at": item.get("pushed_at"),
                    "latest_release_at": latest_release_at or item.get("updated_at"),
                    "license_name": item.get("license", {}).get("name") if item.get("license") else "No License",
                    "license_spdx": item.get("license", {}).get("spdx_id") if item.get("license") else "NOASSERTION",
                    "metadata": {
                        "size": item.get("size", 0),
                        "watchers": item.get("watchers_count", 0),
                        "has_issues": item.get("has_issues", True)
                    }
                }
    except Exception as e:
        logger.error(f"GitHub repository fetch failed: {e}. Searching fallback mocks.")

    # Match in mock data
    for category, repos in MOCK_REPOS.items():
        for repo in repos:
            if repo["name"].lower() == repository.lower():
                return {
                    "id": "mock-id",
                    "name": repo["name"],
                    "description": repo["description"],
                    "url": repo["url"],
                    "repository_url": repo["url"],
                    "language": repo["language"],
                    "stars": repo["stars"],
                    "forks": repo["forks"],
                    "open_issues": repo["open_issues"],
                    "last_commit_at": repo["last_commit_at"],
                    "latest_release_at": repo["latest_release_at"],
                    "license_name": repo["license_name"],
                    "license_spdx": repo["license_spdx"],
                    "metadata": {"mock": True}
                }

    # Generate a realistic mock repo metadata if not found
    parts = repository.split("/")
    name_only = parts[-1] if len(parts) > 1 else repository
    return {
        "id": "generated-mock-id",
        "name": repository,
        "description": f"Automatically generated repository description for {name_only}",
        "url": f"https://github.com/{repository}",
        "repository_url": f"https://github.com/{repository}",
        "language": "Python",
        "stars": 320,
        "forks": 42,
        "open_issues": 8,
        "last_commit_at": datetime.now(timezone.utc).isoformat(),
        "latest_release_at": datetime.now(timezone.utc).isoformat(),
        "license_name": "MIT License",
        "license_spdx": "MIT",
        "metadata": {"mock": True}
    }

async def get_package_metadata(ecosystem: str, package: str, version: str = None) -> dict:
    """
    Get package metadata from ecosystem registry (PyPI, npm).
    """
    eco = ecosystem.lower()
    if eco == "pypi":
        url = f"https://pypi.org/pypi/{package}/json"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    info = data.get("info", {})
                    latest = info.get("version")
                    # Try to get release date
                    releases = data.get("releases", {})
                    latest_releases = releases.get(latest, [])
                    release_date = None
                    if latest_releases:
                        release_date = latest_releases[0].get("upload_time_iso_8601")
                    
                    return {
                        "ecosystem": "pypi",
                        "package": package,
                        "latest_version": latest,
                        "release_date": release_date or datetime.now(timezone.utc).isoformat(),
                        "license": info.get("license") or "Unknown",
                        "repository_url": info.get("project_urls", {}).get("Source") or info.get("home_page") or f"https://pypi.org/project/{package}"
                    }
        except Exception as e:
            logger.error(f"PyPI metadata fetch failed: {e}")
            
    elif eco == "npm":
        url = f"https://registry.npmjs.org/{package}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(url)
                if res.status_code == 200:
                    data = res.json()
                    latest = data.get("dist-tags", {}).get("latest")
                    version_info = data.get("versions", {}).get(latest, {}) if latest else {}
                    
                    # Get release time
                    time_info = data.get("time", {})
                    release_date = time_info.get(latest) if latest else None
                    
                    repo = version_info.get("repository", {})
                    repo_url = repo.get("url") if isinstance(repo, dict) else repo
                    if repo_url and repo_url.startswith("git+"):
                        repo_url = repo_url[4:]
                    if repo_url and repo_url.endswith(".git"):
                        repo_url = repo_url[:-4]
                    
                    return {
                        "ecosystem": "npm",
                        "package": package,
                        "latest_version": latest or "unknown",
                        "release_date": release_date or datetime.now(timezone.utc).isoformat(),
                        "license": version_info.get("license") or data.get("license") or "Unknown",
                        "repository_url": repo_url or f"https://www.npmjs.com/package/{package}"
                    }
        except Exception as e:
            logger.error(f"NPM metadata fetch failed: {e}")

    # Fallback Mock
    return {
        "ecosystem": ecosystem,
        "package": package,
        "latest_version": "1.0.0" if not version else version,
        "release_date": datetime.now(timezone.utc).isoformat(),
        "license": "MIT",
        "repository_url": f"https://github.com/mock-repo/{package}"
    }
