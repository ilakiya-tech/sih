import zipfile
import os
import pandas as pd
import json
import ast
import hashlib

WORK_DIR = r"C:\Users\Dell\Downloads\sih\data_processing"
os.makedirs(WORK_DIR, exist_ok=True)

DS3_ZIP = r"C:\Users\Dell\Downloads\archive (3).zip"
DS4_ZIP = r"C:\Users\Dell\Downloads\archive (4).zip"
DS5_ZIP = r"C:\Users\Dell\Downloads\archive (5).zip"

print("Extracting ZIP files...")
for zfile in [DS3_ZIP, DS4_ZIP, DS5_ZIP]:
    if os.path.exists(zfile):
        with zipfile.ZipFile(zfile, 'r') as zf:
            zf.extractall(WORK_DIR)
    else:
        print(f"Warning: {zfile} not found.")

print("Reading CSVs...")
ds3_df = pd.read_csv(os.path.join(WORK_DIR, "Aicte Intership Dataset.csv")) if os.path.exists(os.path.join(WORK_DIR, "Aicte Intership Dataset.csv")) else pd.DataFrame()
ds4_df = pd.read_csv(os.path.join(WORK_DIR, "LinkedIn_Jobs_Data_India.csv")) if os.path.exists(os.path.join(WORK_DIR, "LinkedIn_Jobs_Data_India.csv")) else pd.DataFrame()
ds5_df = pd.read_csv(os.path.join(WORK_DIR, "internship_data.csv")) if os.path.exists(os.path.join(WORK_DIR, "internship_data.csv")) else pd.DataFrame()

# Filter DS4
if not ds4_df.empty:
    ds4_df = ds4_df[ds4_df['experienceLevel'].isin(['Entry level', 'Internship'])]

records = []

def map_domain(role):
    r = str(role).lower()
    if any(k in r for k in ['software', 'developer', 'programmer', 'engineer']): return 'Software Engineering'
    if any(k in r for k in ['web', 'frontend', 'react', 'node', 'html']): return 'Web Development'
    if any(k in r for k in ['data', 'analytics', 'bi', 'business intelligence', 'sql']): return 'Data Science'
    if any(k in r for k in ['machine learning', 'ai', 'deep learning', 'nlp', 'computer vision']): return 'Machine Learning'
    if any(k in r for k in ['devops', 'cloud', 'infrastructure', 'sre', 'kubernetes']): return 'DevOps'
    if any(k in r for k in ['android', 'ios', 'flutter', 'mobile', 'swift']): return 'Mobile Development'
    if any(k in r for k in ['security', 'cyber', 'vapt', 'penetration']): return 'Cybersecurity'
    if any(k in r for k in ['design', 'ui', 'ux', 'figma', 'graphic', 'creative']): return 'UI/UX Design'
    if any(k in r for k in ['product', 'pm', 'roadmap', 'product management']): return 'Product Management'
    if any(k in r for k in ['marketing', 'seo', 'social media', 'content', 'digital']): return 'Digital Marketing'
    if any(k in r for k in ['finance', 'accounting', 'fintech', 'investment', 'banking']): return 'Finance'
    if any(k in r for k in ['hr', 'human resources', 'recruitment', 'talent']): return 'Human Resources'
    return 'General'

def get_hash(company, role, city):
    s = f"{company}_{role}_{city}".encode('utf-8')
    return hashlib.sha256(s).hexdigest()[:8]

def clean_company(c):
    c = str(c)
    for s in [' LLP', ' Pvt Ltd', ' Private Limited', ' Inc.', ' LLC', ' Pvt. Ltd.']:
        if c.endswith(s):
            c = c[:-len(s)]
    return c.title().strip()

print("Processing DS5...")
if not ds5_df.empty:
    ds5_df = ds5_df.drop_duplicates(subset=['Internship Id'])
    for _, row in ds5_df.iterrows():
        company = clean_company(row.get('Company Name', ''))
        role = str(row.get('Role', ''))
        if role.endswith(' Internship'): role = role[:-11]
        if role.endswith(' (Remote)'): role = role[:-9]
        role = role.strip()
        
        skills_raw = row.get('Skills', '[]')
        try:
            skills_list = ast.literal_eval(skills_raw) if pd.notna(skills_raw) else []
        except:
            skills_list = []
        
        loc_raw = row.get('Location', "()")
        is_wfh = False
        city = 'Remote'
        try:
            locs = ast.literal_eval(loc_raw) if pd.notna(loc_raw) else []
            if isinstance(locs, (tuple, list)):
                non_wfh = [l for l in locs if str(l).lower() != 'work from home']
                if non_wfh:
                    city = non_wfh[0]
                if 'work from home' in [str(l).lower() for l in locs]:
                    is_wfh = True
            elif isinstance(locs, str):
                city = locs
                if city.lower() == 'work from home':
                    is_wfh = True
                    city = 'Remote'
        except:
            pass
            
        work_mode = "Remote" if is_wfh else "On-site"
        stipend = str(row.get('Stipend', 'Not disclosed'))
        stipend = stipend.replace(' ', '') if ' ' in stipend else stipend
            
        duration = str(row.get('Duration', 'Not specified'))
        intern_type = str(row.get('Intern Type', 'Internship'))
        
        perks_raw = row.get('Perks', '[]')
        try:
            perks = ast.literal_eval(perks_raw) if pd.notna(perks_raw) else []
            if isinstance(perks, str):
                perks = [p.strip() for p in perks.split(',') if p.strip()]
        except:
            perks = []
        
        app_count = row.get('Number of Applications', 0)
        try:
            app_count = int(app_count) if pd.notna(app_count) else 0
        except:
            app_count = 0
            
        desc = f"{role} at {company} in {city}. Duration: {duration}. Stipend: {stipend}. Skills required: {', '.join(skills_list)}. Work mode: {work_mode}. Internship type: {intern_type}."
        
        if not role or not company or (not skills_list and not desc):
            continue
            
        record = {
            "id": f"real-is-{get_hash(company, role, city)}",
            "title": role,
            "company": company,
            "location": city,
            "domain": map_domain(role),
            "description": desc,
            "required_skills": skills_list,
            "preferred_skills": [],
            "stipend": stipend,
            "duration": duration,
            "work_mode": work_mode,
            "education_level": "Undergraduate",
            "perks": perks if isinstance(perks, list) else [],
            "intern_type": intern_type,
            "application_count": app_count,
            "source": "internshala",
            "city": city,
            "state": ""
        }
        records.append(record)

print("Processing DS4...")
if not ds4_df.empty:
    for _, row in ds4_df.iterrows():
        company = clean_company(row.get('companyName', ''))
        role = str(row.get('title', ''))
        city = str(row.get('city', ''))
        state = str(row.get('state', ''))
        desc = str(row.get('description', ''))
        
        if pd.isna(desc) or desc == 'nan': desc = ''
        
        skills = []
        if 'Skill:' in desc:
            parts = desc.split('Skill:')
            if len(parts) > 1:
                s_text = parts[1].split('.')[0].split('\n')[0]
                skills = [s.strip() for s in s_text.split(',') if s.strip()]
                
        work_mode = "On-site"
        wt = str(row.get('workType', '')).lower()
        if 'remote' in wt: work_mode = 'Remote'
        elif 'hybrid' in wt: work_mode = 'Hybrid'
        
        if not role or not company or not desc:
            continue
            
        record = {
            "id": f"real-li-{get_hash(company, role, city)}",
            "title": role,
            "company": company,
            "location": f"{city}, {state}" if state and state != 'nan' else city,
            "domain": map_domain(role),
            "description": desc,
            "required_skills": skills,
            "preferred_skills": [],
            "stipend": "Not disclosed",
            "duration": "Not specified",
            "work_mode": work_mode,
            "education_level": "Undergraduate",
            "perks": [],
            "intern_type": "Internship",
            "application_count": int(row.get('applicationsCount', 0)) if pd.notna(row.get('applicationsCount')) else 0,
            "source": "linkedin_india",
            "city": city,
            "state": state if state != 'nan' else ""
        }
        records.append(record)

print("Processing DS3...")
if not ds3_df.empty:
    state_city_map = {
        'kerala': 'Thiruvananthapuram', 'maharashtra': 'Mumbai', 'karnataka': 'Bengaluru',
        'delhi': 'New Delhi', 'tamil nadu': 'Chennai', 'telangana': 'Hyderabad',
        'gujarat': 'Ahmedabad', 'uttar pradesh': 'Lucknow', 'west bengal': 'Kolkata',
        'rajasthan': 'Jaipur', 'haryana': 'Gurugram'
    }

    for _, row in ds3_df.iterrows():
        company = clean_company(row.get('Company Name', ''))
        role = str(row.get('Job Title', '')).title()
        state = str(row.get('States', ''))
        city = str(row.get('Cities', ''))
        
        if pd.isna(city) or city == 'nan' or not city.strip():
            city = state_city_map.get(state.lower().strip(), state)
            
        stipend = str(row.get('Stipend', ''))
        if '00 /' in stipend or stipend.replace(' ', '').isdigit():
            if ' ' in stipend and stipend.split(' ')[0].isdigit():
                stipend = f"Rs.{stipend.split(' ')[0]}/month"
                
        duration = str(row.get('Duration', 'Not specified'))
        
        domain = map_domain(role)
        skills = []
        if domain == 'Software Engineering': skills = ['Python', 'Java', 'C++']
        elif domain == 'Web Development': skills = ['HTML', 'CSS', 'JavaScript']
        elif domain == 'Data Science': skills = ['Python', 'SQL', 'Data Analysis']
        
        desc = f"{role} at {company} in {city}. Duration: {duration}. Stipend: {stipend}. Skills required: {', '.join(skills)}. Work mode: On-site. Internship type: {row.get('Job Type', 'Internship')}."
        
        if not role or not company: continue
        
        record = {
            "id": f"real-ac-{get_hash(company, role, city)}",
            "title": role,
            "company": company,
            "location": f"{city}, {state}" if state and state != 'nan' else city,
            "domain": domain,
            "description": desc,
            "required_skills": skills,
            "preferred_skills": [],
            "stipend": stipend if stipend else "Not disclosed",
            "duration": duration,
            "work_mode": "On-site",
            "education_level": "Undergraduate",
            "perks": [],
            "intern_type": str(row.get('Job Type', 'Internship')),
            "application_count": 0,
            "source": "aicte",
            "city": city,
            "state": state if state != 'nan' else ""
        }
        records.append(record)

print("Deduplicating...")
seen = set()
final_records = []
for r in records:
    key = (r['company'].lower(), r['title'].lower(), r['city'].lower())
    if key not in seen:
        seen.add(key)
        final_records.append(r)

output_path = r"C:\Users\Dell\Downloads\sih\backend\data\internships.json"
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(final_records, f, indent=2)

print(f"Total processed records written to {output_path}: {len(final_records)}")
