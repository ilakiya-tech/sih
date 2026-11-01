import sys
import shutil
import os

sys.path.append(r'C:\Users\Dell\Downloads\sih\backend')
db_path = r'C:\Users\Dell\Downloads\sih\backend\chroma_db'

if os.path.exists(db_path):
    print("Deleting old ChromaDB...")
    shutil.rmtree(db_path)

from app.services.chroma import get_chroma_service

print("Re-seeding ChromaDB with new metadata...")
chroma = get_chroma_service()
count = chroma.seed_if_empty()
print(f"Successfully seeded {count} records with new metadata!")
