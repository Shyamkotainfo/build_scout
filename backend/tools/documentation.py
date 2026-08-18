import logging
from datetime import datetime, timezone

logger = logging.getLogger("buildsmart.tools.documentation")

# Predefined high quality reference snippets for popular candidate libraries
DOCS_STORE = {
    "pymupdf": {
        "title": "PyMuPDF - Text Extraction Guide",
        "url": "https://pymupdf.readthedocs.io/en/latest/recipes-text.html",
        "text": "To extract text from a PDF page, use `page.get_text(\"text\")`. This returns plain unicode text. You can also specify \"blocks\", \"words\", or \"html\" to retrieve formatting and structural information."
    },
    "pdfplumber": {
        "title": "pdfplumber - Extracting Tables",
        "url": "https://github.com/jsvine/pdfplumber#extracting-tables",
        "text": "pdfplumber offers customizable table extraction settings. Use `page.extract_table(settings)` to detect tabular boundaries. Settings include: vertical_strategy (lines/text), horizontal_strategy."
    },
    "pypdf": {
        "title": "pypdf - Page Manipulation",
        "url": "https://pypdf.readthedocs.io/en/stable/user/file-size.html",
        "text": "pypdf can split, merge, crop and rotate PDF pages. Use `PdfReader` and `PdfWriter` to assemble pages from multiple sources and compress output streams to reduce storage footprint."
    },
    "faiss": {
        "title": "FAISS - Index Types and Selection Guide",
        "url": "https://github.com/facebookresearch/faiss/wiki/Guidelines-to-choose-an-index",
        "text": "For dense vectors, FAISS offers `IndexFlatL2` for exact search, `IndexIVFFlat` for inverted file indexes, and `IndexHNSWFlat` for fast graph-based approximate nearest neighbor search."
    },
    "chromadb": {
        "title": "Chroma DB - Vector Database API",
        "url": "https://docs.trychroma.com/usage-guide",
        "text": "Create collection with `client.create_collection(name)`. Add items with `collection.add(documents, metadatas, ids, embeddings)`. Query with `collection.query(query_embeddings, n_results)`."
    },
    "pgvector": {
        "title": "pgvector - PostgreSQL Vector Operations",
        "url": "https://github.com/pgvector/pgvector#getting-started",
        "text": "Enable extension with `CREATE EXTENSION vector;`. Create table with `embedding vector(1536)`. Insert with `INSERT INTO items (embedding) VALUES ('[1,2,3]');`. Select with `ORDER BY embedding <=> '[3,1,2]' LIMIT 5;`."
    }
}

async def search_documentation(query: str) -> dict:
    """
    Search official documentation for candidate libraries.
    """
    query_lower = query.lower()
    results = []
    for key, doc in DOCS_STORE.items():
        if key in query_lower:
            results.append({
                "title": doc["title"],
                "url": doc["url"],
                "snippet": doc["text"][:300],
                "source": "documentation"
            })
            
    if not results:
        results.append({
            "title": f"Documentation Guide: {query}",
            "url": f"https://www.google.com/search?q={query}+official+documentation",
            "snippet": f"Official documentation references and integration walkthroughs for {query}.",
            "source": "documentation"
        })
        
    return {"results": results}
