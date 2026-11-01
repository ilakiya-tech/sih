import json
import pandas as pd
from collections import Counter
import re

DATA_PATH = r"C:\Users\Dell\Downloads\sih\backend\data\internships.json"

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    data = json.load(f)

df = pd.DataFrame(data)

# Phase 1: Schema Validation
missing_counts = df.isnull().sum().to_dict()
empty_strings = (df == "").sum().to_dict()

# Phase 2: Data Quality
duplicate_ids = df['id'].duplicated().sum()
duplicate_desc = df.duplicated(subset=['company', 'title', 'description']).sum()

# Phase 3: Skills
all_skills = []
for skills in df['required_skills'].dropna():
    all_skills.extend(skills)

skill_counts = Counter(all_skills)
skill_lower_counts = Counter([s.lower() for s in all_skills])

# Phase 4 & 6: Locations & Stats
work_mode_counts = df['work_mode'].value_counts().to_dict()
top_companies = df['company'].value_counts().head(10).to_dict()
top_cities = df['city'].value_counts().head(10).to_dict()
top_domains = df['domain'].value_counts().head(10).to_dict()
top_skills = skill_counts.most_common(15)

print("=== SCHEMA ===")
print("Missing:", missing_counts)
print("Empty Strings:", empty_strings)

print("\n=== DUPLICATES ===")
print("Dup IDs:", duplicate_ids)
print("Dup Desc:", duplicate_desc)

print("\n=== WORK MODE ===")
print(work_mode_counts)

print("\n=== TOP COMPANIES ===")
for k, v in top_companies.items(): print(f"{k}: {v}")

print("\n=== TOP CITIES ===")
for k, v in top_cities.items(): print(f"{k}: {v}")

print("\n=== TOP DOMAINS ===")
for k, v in top_domains.items(): print(f"{k}: {v}")

print("\n=== TOP SKILLS ===")
for k, v in top_skills: print(f"{k}: {v}")

print("\n=== RAW COUNTS ===")
print("Total records:", len(df))
print("Unique skills (case-sensitive):", len(skill_counts))
print("Unique skills (case-insensitive):", len(skill_lower_counts))
