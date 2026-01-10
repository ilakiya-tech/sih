from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import json
from datetime import datetime
import io
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import os

app = FastAPI(title="InternPath API - ML Powered", version="2.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==================== DATA MODELS ====================

class UserProfile(BaseModel):
    education: str
    skills: str
    interests: str
    domains: List[str]
    location: str

class RecommendationResponse(BaseModel):
    id: int
    title: str
    company: str
    location: str
    match_score: float
    match_percentage: str
    skills: List[str]
    stipend: str
    duration: str
    type: str
    skill_gaps: List[str]
    why_matched: str
    learning_resources: List[dict]

# ==================== LOAD TRAINED MODEL ====================

class TrainedRecommendationEngine:
    def __init__(self):
        self.model_path = "models/"
        self.vectorizer = None
        self.internship_features = None
        self.internships_data = None
        self.is_loaded = False
        
        # Try to load the trained model
        self.load_model()
    
    def load_model(self):
        """Load trained model from disk"""
        try:
            print("🔄 Loading trained ML model...")
            
            # Load TF-IDF vectorizer
            with open(f'{self.model_path}tfidf_vectorizer.pkl', 'rb') as f:
                self.vectorizer = pickle.load(f)
            
            # Load feature matrix
            with open(f'{self.model_path}internship_features.pkl', 'rb') as f:
                self.internship_features = pickle.load(f)
            
            # Load internship data
            with open(f'{self.model_path}internship_data.pkl', 'rb') as f:
                self.internships_data = pickle.load(f)
            
            # Load metadata
            with open(f'{self.model_path}model_metadata.json', 'r') as f:
                self.metadata = json.load(f)
            
            self.is_loaded = True
            print(f"✅ Model loaded successfully!")
            print(f"📊 Loaded {len(self.internships_data)} internships")
            print(f"📐 Feature dimensions: {self.metadata['feature_dimensions']}")
            
        except FileNotFoundError:
            print("⚠️  Trained model not found!")
            print("Please run: python train_model.py")
            print("Using fallback sample data...")
            self.is_loaded = False
            self.load_sample_data()
        except Exception as e:
            print(f"❌ Error loading model: {e}")
            print("Using fallback sample data...")
            self.is_loaded = False
            self.load_sample_data()
    
    def load_sample_data(self):
        """Load sample data as fallback"""
        # Your original 10 sample internships as fallback
        self.internships_data = [
            {
                "id": 1,
                "title": "Frontend Developer Intern",
                "company": "TechCorp India",
                "description": "Build responsive web applications using React",
                "skills": "JavaScript, React, HTML, CSS",
                "domain": "tech",
                "location": "Mumbai, Remote",
                "education_level": "undergraduate",
                "stipend": "₹25,000/month",
                "duration": "6 months",
                "type": "remote"
            },
            # ... add other 9 sample internships
        ]
        
        # Create simple vectorizer for sample data
        self.vectorizer = TfidfVectorizer(max_features=100, stop_words='english')
        texts = [
            f"{i['title']} {i['description']} {i['skills']} {i['domain']}"
            for i in self.internships_data
        ]
        self.internship_features = self.vectorizer.fit_transform(texts)
        
        print("✅ Sample data loaded as fallback")
    
    def calculate_skill_match(self, user_skills: str, internship_skills: str) -> float:
        """Calculate skill match percentage"""
        if isinstance(internship_skills, list):
            required_skills = [s.strip().lower() for s in internship_skills]
        else:
            required_skills = [s.strip().lower() for s in str(internship_skills).split(',')]
        
        user_skill_list = [s.strip().lower() for s in user_skills.split(',')]
        
        matches = sum(
            1 for skill in user_skill_list 
            if any(skill in req or req in skill for req in required_skills)
        )
        
        if not required_skills:
            return 0.0
        
        return (matches / len(required_skills)) * 100
    
    def check_location_match(self, user_location: str, internship_location: str) -> float:
        """Check location compatibility"""
        user_loc = user_location.lower()
        intern_loc = str(internship_location).lower()
        
        if 'remote' in intern_loc or 'anywhere' in intern_loc:
            return 100.0
        
        if 'remote' in user_loc or 'anywhere' in user_loc:
            return 100.0
        
        # Check for city/state matches
        user_parts = user_loc.split(',')
        for part in user_parts:
            part = part.strip()
            if part and part in intern_loc:
                return 100.0
        
        return 30.0
    
    def check_education_match(self, user_education: str, required_education: str) -> float:
        """Check education level compatibility"""
        education_hierarchy = {
            'high_school': 1,
            'diploma': 2,
            'undergraduate': 3,
            'postgraduate': 4
        }
        
        user_level = education_hierarchy.get(user_education, 0)
        required_level = education_hierarchy.get(required_education, 0)
        
        if user_level >= required_level:
            return 100.0
        elif user_level == required_level - 1:
            return 70.0
        else:
            return 40.0
    
    def check_domain_match(self, user_domains: List[str], internship_domain: str) -> float:
        """Check if domain matches"""
        if internship_domain in user_domains:
            return 100.0
        return 0.0
    
    def get_skill_gaps(self, user_skills: str, internship_skills) -> List[str]:
        """Identify missing skills"""
        if isinstance(internship_skills, list):
            required_skills = [s.strip().lower() for s in internship_skills]
        else:
            required_skills = [s.strip().lower() for s in str(internship_skills).split(',')]
        
        user_skill_list = [s.strip().lower() for s in user_skills.split(',')]
        
        gaps = []
        for req_skill in required_skills[:5]:  # Limit to top 5
            if not any(req_skill in user_skill or user_skill in req_skill for user_skill in user_skill_list):
                gaps.append(req_skill.title())
        
        return gaps[:3]  # Return top 3 gaps
    
    def get_learning_resources(self, skill_gaps: List[str]) -> List[dict]:
        """Get learning resources for skill gaps"""
        resource_map = {
            "python": {"name": "Python Programming", "platform": "NPTEL", "url": "https://nptel.ac.in"},
            "javascript": {"name": "JavaScript Basics", "platform": "SWAYAM", "url": "https://swayam.gov.in"},
            "react": {"name": "React Development", "platform": "freeCodeCamp", "url": "https://freecodecamp.org"},
            "data": {"name": "Data Analysis", "platform": "NPTEL", "url": "https://nptel.ac.in"},
            "excel": {"name": "Excel Fundamentals", "platform": "SWAYAM", "url": "https://swayam.gov.in"},
            "java": {"name": "Java Programming", "platform": "NPTEL", "url": "https://nptel.ac.in"},
            "sql": {"name": "SQL Basics", "platform": "SWAYAM", "url": "https://swayam.gov.in"},
        }
        
        resources = []
        for gap in skill_gaps:
            gap_lower = gap.lower()
            for key, resource in resource_map.items():
                if key in gap_lower:
                    resources.append(resource)
                    break
            else:
                resources.append({
                    "name": f"Learn {gap}",
                    "platform": "YouTube/Coursera",
                    "url": f"https://www.youtube.com/results?search_query=learn+{gap.replace(' ', '+')}"
                })
        
        return resources[:3]
    
    def generate_match_explanation(self, skill_match, domain_match, location_match, education_match):
        """Generate explanation for the match"""
        reasons = []
        
        if skill_match >= 70:
            reasons.append(f"{int(skill_match)}% Skill Match")
        elif skill_match >= 50:
            reasons.append(f"Good Skills ({int(skill_match)}%)")
        
        if domain_match == 100:
            reasons.append("Perfect Domain Fit")
        
        if location_match == 100:
            reasons.append("Location Compatible")
        
        if education_match == 100:
            reasons.append("Education Meets Requirements")
        
        if not reasons:
            reasons.append("Growth Opportunity")
        
        return ", ".join(reasons)
    
    def recommend(self, profile: UserProfile, top_n: int = 5) -> List[RecommendationResponse]:
        """Generate personalized recommendations using trained model"""
        
        # Create user profile text
        profile_text = f"{profile.skills} {profile.interests} {' '.join(profile.domains)}"
        
        # Transform user profile using trained vectorizer
        profile_vector = self.vectorizer.transform([profile_text])
        
        # Calculate cosine similarity with all internships
        similarities = cosine_similarity(profile_vector, self.internship_features)[0]
        
        recommendations = []
        
        for idx, internship in enumerate(self.internships_data):
            # Text similarity from trained model
            text_similarity = similarities[idx] * 100
            
            # Individual match scores
            internship_skills = internship.get('skills', '')
            if isinstance(internship_skills, list):
                internship_skills = ', '.join(internship_skills)
            
            skill_match = self.calculate_skill_match(profile.skills, internship_skills)
            domain_match = self.check_domain_match(profile.domains, internship.get('domain', ''))
            location_match = self.check_location_match(profile.location, internship.get('location', ''))
            education_match = self.check_education_match(profile.education, internship.get('education_level', 'undergraduate'))
            
            # Weighted final score
            final_score = (
                text_similarity * 0.25 +      # 25% from trained model
                skill_match * 0.35 +          # 35% skills
                domain_match * 0.25 +         # 25% domain
                location_match * 0.10 +       # 10% location
                education_match * 0.05        # 5% education
            )
            
            # Get skill gaps and resources
            skill_gaps = self.get_skill_gaps(profile.skills, internship_skills)
            learning_resources = self.get_learning_resources(skill_gaps)
            
            # Generate explanation
            why_matched = self.generate_match_explanation(
                skill_match, domain_match, location_match, education_match
            )
            
            # Extract skills list
            if isinstance(internship.get('skills'), list):
                skills_list = internship['skills'][:3]
            else:
                skills_list = [s.strip() for s in str(internship.get('skills', '')).split(',')][:3]
            
            recommendations.append(RecommendationResponse(
                id=internship.get('id', idx),
                title=internship.get('title', 'Internship'),
                company=internship.get('company', 'Company'),
                location=internship.get('location', 'Location'),
                match_score=round(final_score, 2),
                match_percentage=f"{int(final_score)}%",
                skills=skills_list,
                stipend=internship.get('stipend', 'Not disclosed'),
                duration=internship.get('duration', '3-6 months'),
                type=internship.get('type', 'onsite'),
                skill_gaps=skill_gaps,
                why_matched=why_matched,
                learning_resources=learning_resources
            ))
        
        # Sort by match score and return top N
        recommendations.sort(key=lambda x: x.match_score, reverse=True)
        return recommendations[:top_n]

# Initialize recommendation engine
recommendation_engine = TrainedRecommendationEngine()

# ==================== API ENDPOINTS ====================

@app.get("/")
def root():
    model_status = "✅ Trained Model Loaded" if recommendation_engine.is_loaded else "⚠️  Using Sample Data"
    return {
        "message": "InternPath API - ML Powered! 🚀",
        "version": "2.0.0",
        "model_status": model_status,
        "total_internships": len(recommendation_engine.internships_data) if recommendation_engine.internships_data else 0,
        "endpoints": [
            "/api/recommend - POST - Get personalized recommendations",
            "/api/internships - GET - Get all internships",
            "/api/generate-resume - POST - Generate PDF resume",
            "/api/model-info - GET - Model information",
            "/health - GET - Health check"
        ]
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "model_loaded": recommendation_engine.is_loaded,
        "total_internships": len(recommendation_engine.internships_data) if recommendation_engine.internships_data else 0
    }

@app.get("/api/model-info")
def get_model_info():
    """Get information about the loaded model"""
    if recommendation_engine.is_loaded:
        return {
            "status": "Trained model loaded",
            "metadata": recommendation_engine.metadata,
            "model_type": "TF-IDF + Cosine Similarity",
            "trained": True
        }
    else:
        return {
            "status": "Using sample data",
            "trained": False,
            "note": "Run train_model.py to train on Kaggle data"
        }

@app.get("/api/internships")
def get_all_internships():
    """Get all available internships"""
    return {
        "internships": recommendation_engine.internships_data[:50],  # Return first 50
        "count": len(recommendation_engine.internships_data) if recommendation_engine.internships_data else 0,
        "model_loaded": recommendation_engine.is_loaded
    }

@app.post("/api/recommend")
def get_recommendations(profile: UserProfile):
    """Get personalized internship recommendations"""
    try:
        recommendations = recommendation_engine.recommend(profile, top_n=5)
        return {
            "success": True,
            "profile": profile.dict(),
            "recommendations": [rec.dict() for rec in recommendations],
            "count": len(recommendations),
            "model_used": "trained_model" if recommendation_engine.is_loaded else "sample_data"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Recommendation error: {str(e)}")

@app.post("/api/generate-resume")
def generate_resume(profile: UserProfile):
    """Generate PDF resume from profile"""
    try:
        # Create PDF in memory
        buffer = io.BytesIO()
        pdf = canvas.Canvas(buffer, pagesize=letter)
        width, height = letter
        
        # Title
        pdf.setFont("Helvetica-Bold", 24)
        pdf.drawString(50, height - 50, "Resume")
        
        # Profile sections
        y_position = height - 100
        
        sections = [
            ("Education", profile.education.replace('_', ' ').title()),
            ("Skills", profile.skills),
            ("Interests", profile.interests),
            ("Preferred Domains", ", ".join(profile.domains)),
            ("Location Preference", profile.location)
        ]
        
        for title, content in sections:
            pdf.setFont("Helvetica-Bold", 14)
            pdf.drawString(50, y_position, title)
            y_position -= 20
            
            pdf.setFont("Helvetica", 11)
            pdf.drawString(70, y_position, content)
            y_position -= 40
        
        pdf.save()
        
        # Get PDF data
        buffer.seek(0)
        pdf_data = buffer.getvalue()
        
        import base64
        pdf_base64 = base64.b64encode(pdf_data).decode('utf-8')
        
        return {
            "success": True,
            "message": "Resume generated successfully",
            "pdf_base64": pdf_base64,
            "filename": f"resume_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Resume generation error: {str(e)}")

# Run with: uvicorn main:app --reload --port 8000
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)