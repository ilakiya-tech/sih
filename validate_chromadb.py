import sys
import os
import json
import numpy as np

sys.path.append(r'C:\Users\Dell\Downloads\sih\backend')

from app.services.chroma import get_chroma_service
from app.services.embedding import get_embedding_model

def run_validation():
    print("=== PHASE 1: EMBEDDING VERIFICATION ===")
    model = get_embedding_model()
    dim = model.get_sentence_embedding_dimension()
    print(f"Model: {model}")
    print(f"Embedding Dimension: {dim}")

    chroma_service = get_chroma_service()
    collection = chroma_service.collection
    count = collection.count()
    print(f"Vector Count in ChromaDB: {count}")
    
    data_path = r'C:\Users\Dell\Downloads\sih\backend\data\internships.json'
    with open(data_path, 'r', encoding='utf-8') as f:
        internships = json.load(f)
    print(f"Internship Count in JSON: {len(internships)}")
    
    print("\n=== PHASE 2: CHROMADB VALIDATION ===")
    peek = collection.peek(limit=10)
    print("Peeked 10 items.")
    print("Checking IDs for uniqueness...")
    all_data = collection.get(include=['metadatas', 'documents'])
    all_ids = all_data['ids']
    unique_ids = set(all_ids)
    print(f"Total IDs: {len(all_ids)}, Unique IDs: {len(unique_ids)}")
    
    print("\n=== PHASE 4: METADATA VALIDATION ===")
    missing_metadata_keys = set()
    required_keys = ['title', 'company', 'location', 'domain', 'work_mode'] # 'stipend' and 'application_url' might not be embedded if not part of schema, but let's check what we have
    if all_data['metadatas']:
        sample_meta = all_data['metadatas'][0]
        print(f"Sample Metadata Keys: {list(sample_meta.keys())}")
        for meta in all_data['metadatas']:
            for k in required_keys:
                if k not in meta:
                    missing_metadata_keys.add(k)
    print(f"Missing Required Metadata Keys across all: {missing_metadata_keys}")

    print("\n=== PHASE 3 & 5: VECTOR SEARCH VALIDATION ===")
    queries = [
        "Python Backend",
        "React Frontend",
        "Machine Learning",
        "Data Science",
        "Android Developer",
        "DevOps",
        "Cybersecurity",
        "UI UX"
    ]
    
    for q in queries:
        print(f"\n--- Query: {q} ---")
        q_emb = model.encode(q).tolist()
        results = collection.query(query_embeddings=[q_emb], n_results=10)
        
        distances = results['distances'][0]
        metadatas = results['metadatas'][0]
        
        for i in range(len(distances)):
            meta = metadatas[i]
            print(f"[{i+1}] Distance: {distances[i]:.4f} | {meta.get('title', 'N/A')} at {meta.get('company', 'N/A')} | Domain: {meta.get('domain', 'N/A')} | Loc: {meta.get('location', 'N/A')}")
        
if __name__ == '__main__':
    run_validation()
