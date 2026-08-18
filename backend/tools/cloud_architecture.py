import logging

logger = logging.getLogger("buildsmart.tools.cloud_architecture")

# Predefined high-quality AWS Reference Architectures
AWS_ARCHITECTURES = {
    "document": [
        {
            "title": "Intelligent Document Processing (IDP) on AWS",
            "url": "https://aws.amazon.com/solutions/guidance/intelligent-document-processing-on-aws/",
            "snippet": "Architecture using Amazon Textract for extraction, AWS Lambda for orchestration, Amazon Comprehend for classification, and Amazon OpenSearch for index/search. Recommended for building AI document search engines."
        },
        {
            "title": "Build a PDF text extraction pipeline with Textract and S3",
            "url": "https://docs.aws.amazon.com/prescriptive-guidance/latest/patterns/extract-text-from-pdfs-using-amazon-textract.html",
            "snippet": "A serverless design pattern using S3 event notifications to trigger AWS Lambda, which invokes Amazon Textract asynchronously for multi-page documents, storing results back in S3."
        }
    ],
    "vector": [
        {
            "title": "Retrieval-Augmented Generation (RAG) Architecture on AWS",
            "url": "https://aws.amazon.com/blogs/machine-learning/build-a-rag-platform-with-amazon-bedrock-and-pgvector/",
            "snippet": "Build a secure RAG architecture using Amazon Bedrock for text generation, Amazon Aurora PostgreSQL with pgvector for vector store, and AWS Secrets Manager for LLM API keys protection."
        },
        {
            "title": "Amazon OpenSearch Serverless Vector Search Guide",
            "url": "https://docs.aws.amazon.com/opensearch-service/latest/developerguide/serverless-vector.html",
            "snippet": "AWS serverless vector search capabilities. Describes HNSW and IVF indexes configuration for semantic search applications with sub-second latency query times."
        }
    ],
    "api": [
        {
            "title": "Serverless Web Application API Architecture",
            "url": "https://aws.amazon.com/architecture/serverless-web-app/",
            "snippet": "Design APIs using Amazon API Gateway, AWS Lambda for serverless compute, and Amazon DynamoDB for low latency transactional state persistence."
        }
    ]
}

def get_fallback_aws(query: str):
    query_lower = query.lower()
    for key, archs in AWS_ARCHITECTURES.items():
        if key in query_lower:
            return archs
    # Default generic cloud guide
    return [
        {
            "title": "AWS Architecture Center: Reference Architecture Diagrams",
            "url": "https://aws.amazon.com/architecture/",
            "snippet": "Official AWS Reference Architecture repository. Contains diagrams, patterns, and guides for designing cloud-native systems using AWS Best Practices."
        }
    ]

async def search_aws_documentation(query: str) -> dict:
    """
    Search AWS Reference Architectures.
    For MVP, uses high quality curated catalog to prevent dynamic hallucination.
    """
    results = get_fallback_aws(query)
    return {"results": results}
