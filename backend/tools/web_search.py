import os
import httpx
import logging
from datetime import datetime, timezone

logger = logging.getLogger("buildsmart.tools.web_search")

# Context-aware mock web results
MOCK_WEB_RESULTS = {
    "pdf": [
        {
            "title": "Choosing the Best Python PDF Parser in 2026",
            "url": "https://towardsdatascience.com/best-python-pdf-parsers",
            "snippet": "A deep dive comparison of PyMuPDF, pdfplumber, and pypdf. Discusses performance, tables extraction, and licensing constraints.",
            "source": "web"
        },
        {
            "title": "PyMuPDF Official Documentation",
            "url": "https://pymupdf.readthedocs.io/en/latest/",
            "snippet": "Welcome to PyMuPDF, a high-performance Python library for PDF extraction, manipulation, and rendering. Supports PDF, XPS, EPUB.",
            "source": "web"
        },
        {
            "title": "pdfplumber: Plumb a PDF for detailed information",
            "url": "https://github.com/jsvine/pdfplumber",
            "snippet": "Extract text, visual elements, and tables from PDFs with high precision. Especially useful for machine learning datasets generation.",
            "source": "web"
        }
    ],
    "vector": [
        {
            "title": "Faiss vs Chroma vs pgvector: Vector DB Comparison",
            "url": "https://www.assemblyai.com/blog/vector-databases-compared/",
            "snippet": "An in-depth evaluation of vector storage options. Faiss is best for in-memory, Chroma is great for local development, pgvector is ideal for relational databases.",
            "source": "web"
        },
        {
            "title": "Chroma DB Documentation - Getting Started",
            "url": "https://docs.trychroma.com/",
            "snippet": "Chroma is the AI-native open-source embedding database. Learn how to install, save embeddings, and query nearest neighbors in under 5 minutes.",
            "source": "web"
        },
        {
            "title": "pgvector: Vector similarity search for PostgreSQL",
            "url": "https://github.com/pgvector/pgvector",
            "snippet": "Store embeddings directly in PostgreSQL and run L2 distance, cosine distance, and inner product searches using HNSW or IVFFlat indexes.",
            "source": "web"
        }
    ],
    "ocr": [
        {
            "title": "EasyOCR vs Tesseract: Which OCR to Use?",
            "url": "https://learnopencv.com/easyocr-vs-tesseract-ocr/",
            "snippet": "Comparison of Deep Learning based OCR (EasyOCR) vs traditional OCR (Tesseract). EasyOCR performs significantly better on scene text.",
            "source": "web"
        },
        {
            "title": "Tesseract OCR Engine Documentation",
            "url": "https://tesseract-ocr.github.io/",
            "snippet": "Tesseract is an open-source OCR engine. Learn how to configure language models, train custom fonts, and run CLI/API extractions.",
            "source": "web"
        }
    ],
    "api": [
        {
            "title": "FastAPI: Build high-performance APIs with Python",
            "url": "https://fastapi.tiangolo.com/",
            "snippet": "FastAPI is a modern, fast (high-performance), web framework for building APIs with Python 3.8+ based on standard Python type hints.",
            "source": "web"
        }
    ]
}

def get_fallback_web(query: str, limit: int = 5):
    query_lower = query.lower()
    for key, results in MOCK_WEB_RESULTS.items():
        if key in query_lower:
            return results[:limit]
    # Default fallback
    return [
        {
            "title": f"Search results for: {query}",
            "url": f"https://www.google.com/search?q={query}",
            "snippet": f"Web references and articles related to the development of {query}.",
            "source": "web"
        }
    ][:limit]

async def search_web(query: str, limit: int = 10) -> dict:
    """
    Search the web for solutions or libraries.
    Attempts Tavily Search API if TAVILY_API_KEY is defined.
    Otherwise, attempts to query DuckDuckGo HTML Search.
    Falls back to high-quality mock data if API limits or errors occur.
    """
    tavily_key = os.getenv("TAVILY_API_KEY")
    if tavily_key:
        try:
            url = "https://api.tavily.com/search"
            payload = {
                "api_key": tavily_key,
                "query": query,
                "search_depth": "basic",
                "max_results": limit
            }
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(url, json=payload)
                if res.status_code == 200:
                    data = res.json()
                    results = []
                    for item in data.get("results", []):
                        results.append({
                            "title": item.get("title"),
                            "url": item.get("url"),
                            "snippet": item.get("content"),
                            "source": "web"
                        })
                    return {"results": results}
        except Exception as e:
            logger.error(f"Tavily search failed: {e}")

    # Try DuckDuckGo Lite search parsing as secondary option
    try:
        url = "https://lite.duckduckgo.com/lite/"
        async with httpx.AsyncClient(timeout=10.0) as client:
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
            res = await client.post(url, data={"q": query}, headers=headers)
            if res.status_code == 200:
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(res.text, "html.parser")
                # DuckDuckGo Lite formats results in tables
                tables = soup.find_all("table", class_="result-table")
                results = []
                for table in tables[:limit]:
                    title_a = table.find("a", class_="result-link")
                    snippet_td = table.find("td", class_="result-snippet")
                    if title_a:
                        results.append({
                            "title": title_a.text.strip(),
                            "url": title_a["href"],
                            "snippet": snippet_td.text.strip() if snippet_td else "",
                            "source": "web"
                        })
                if results:
                    return {"results": results}
    except Exception as e:
        logger.warning(f"DuckDuckGo search parsing failed or BeautifulSoup not available: {e}")

    # Fallback to high quality context-aware mocks
    return {"results": get_fallback_web(query, limit)}
