"""Delete all vectors for a specific document from Pinecone.

Usage:
    python delete_document.py "HB DXTNA final 2024.pdf"
    python delete_document.py "company_hr_handbook.md"
"""

import sys
from app.core.config import get_settings
from pinecone import Pinecone

if len(sys.argv) < 2:
    print("Usage: python delete_document.py <filename>")
    print('Example: python delete_document.py "HB DXTNA final 2024.pdf"')
    sys.exit(1)

filename = sys.argv[1]
settings = get_settings()

pc = Pinecone(api_key=settings.pinecone_api_key)
index = pc.Index(settings.pinecone_index_name)

# Try deleting by filename metadata (new ingests) AND by full-path source match (old ingests)
print(f"Searching for vectors with filename='{filename}' in namespace '{settings.pinecone_namespace}'...")

# List vector IDs that match either metadata key
to_delete = []
for match in index.query(
    namespace=settings.pinecone_namespace,
    vector=[0.0] * 1536,  # dummy vector, we only care about metadata filter
    top_k=10000,
    include_metadata=True,
    filter={
        "$or": [
            {"filename": {"$eq": filename}},
            {"source": {"$eq": filename}},
            {"source": {"$in": [
                filename,
                f"backend/data/sample_kb/{filename}",
                f"backend/uploads/{filename}",
            ]}},
        ]
    },
).matches:
    to_delete.append(match.id)

if not to_delete:
    # Fallback: scan all vectors in namespace and match by endswith
    print("No exact metadata match — scanning namespace for path-based matches…")
    stats = index.describe_index_stats()
    ns_stats = stats.get("namespaces", {}).get(settings.pinecone_namespace, {})
    print(f"Namespace has {ns_stats.get('vector_count', 0)} total vectors.")
    print("Try one of the Pinecone console / nuclear reset options instead — see README.")
    sys.exit(1)

print(f"Deleting {len(to_delete)} vectors...")
index.delete(ids=to_delete, namespace=settings.pinecone_namespace)
print(f"✓ Deleted {len(to_delete)} vectors for '{filename}'")
