import sys
import os
import time
import json
sys.path.append(r"C:\Users\Dell\Downloads\sih\backend")

from app.services.recommender import recommend_for_profile
from app.services.chroma import get_chroma_service
from app.services.embedding import get_embedding_model

PROFILES = [
    {
        "name": "Backend Development",
        "education": "Undergraduate",
        "skills": "Python, Django, FastAPI, SQL, PostgreSQL, Docker",
        "interests": "Building scalable APIs, database design",
        "domains": ["Software Engineering"],
        "location": "Remote"
    },
    {
        "name": "Frontend Development",
        "education": "Undergraduate",
        "skills": "HTML, CSS, JavaScript, React, Tailwind CSS",
        "interests": "Creating responsive user interfaces, UX design",
        "domains": ["Web Development"],
        "location": "Bengaluru"
    },
    {
        "name": "Machine Learning",
        "education": "Postgraduate",
        "skills": "Python, TensorFlow, PyTorch, Scikit-Learn, NLP",
        "interests": "Deep learning, natural language processing",
        "domains": ["Machine Learning", "Data Science"],
        "location": "Hyderabad"
    },
    {
        "name": "Data Science",
        "education": "Undergraduate",
        "skills": "Python, SQL, Pandas, NumPy, Data Visualization",
        "interests": "Data analysis, statistical modeling",
        "domains": ["Data Science"],
        "location": "Mumbai"
    },
    {
        "name": "DevOps",
        "education": "Undergraduate",
        "skills": "Linux, Bash, Docker, Kubernetes, CI/CD, AWS",
        "interests": "Cloud infrastructure, automation",
        "domains": ["DevOps"],
        "location": "Pune"
    },
    {
        "name": "UI/UX",
        "education": "Diploma",
        "skills": "Figma, Adobe XD, Wireframing, Prototyping",
        "interests": "User research, interaction design",
        "domains": ["UI/UX Design"],
        "location": "Delhi"
    },
    {
        "name": "Cybersecurity",
        "education": "Undergraduate",
        "skills": "Network Security, Penetration Testing, Kali Linux, Python",
        "interests": "Ethical hacking, vulnerability assessment",
        "domains": ["Cybersecurity"],
        "location": "Chennai"
    },
    {
        "name": "Mobile Development",
        "education": "Undergraduate",
        "skills": "Java, Kotlin, Android Studio, Flutter",
        "interests": "Building Android applications",
        "domains": ["Mobile Development"],
        "location": "Remote"
    }
]

def run_evaluation():
    chroma_service = get_chroma_service()
    if chroma_service.collection.count() == 0:
        print("ChromaDB is empty. Seeding...")
        chroma_service.seed_if_empty()
        
    print(f"Total Internships in ChromaDB: {chroma_service.collection.count()}")
    
    results_summary = []
    
    for prof in PROFILES:
        print(f"\n======================================")
        print(f"Evaluating Profile: {prof['name']}")
        print(f"Skills: {prof['skills']}")
        print(f"======================================")
        
        start_time = time.time()
        
        try:
            from types import SimpleNamespace
            obj = SimpleNamespace(**prof)
            if isinstance(obj.domains, list):
                obj.domains = json.dumps(obj.domains)
            
            response = recommend_for_profile(obj, top_k=5)
            end_time = time.time()
            
            latency = end_time - start_time
            print(f"Total Latency: {latency:.2f} seconds")
            
            print(f"Match Score Avg: {sum(r.match_percentage for r in response.recommendations)/5:.2f}%")
            
            for i, rec in enumerate(response.recommendations):
                print(f"\n[Rank {i+1}] {rec.title} at {rec.company}")
                print(f"Domain: {rec.domain} | Location: {rec.location}")
                print(f"Match: {rec.match_percentage}%")
                print(f"Matched Skills: {', '.join(rec.matched_skills)}")
                print(f"Gap Skills: {', '.join(rec.missing_skills)}")
                print(f"AI Explanation: {rec.ai_explanation}")
                
            results_summary.append({
                "profile": prof['name'],
                "latency": latency,
                "avg_match": sum(r.match_percentage for r in response.recommendations)/5
            })
        except Exception as e:
            print(f"Error evaluating {prof['name']}: {e}")
            
    print("\n\n=== PERFORMANCE SUMMARY ===")
    for res in results_summary:
        print(f"{res['profile']}: {res['latency']:.2f}s latency, {res['avg_match']:.2f}% avg match")

if __name__ == '__main__':
    run_evaluation()
