🎓 InternPath – AI-Driven Internship Recommendation Engine

InternPath is an AI-powered internship recommendation system built for the Smart India Hackathon (SIH) 2025 under the PM Internship Scheme.
It helps students discover internships that match their skills, interests, education, domain preference, and location, and also guides them on what skills to improve.

📖 About the Project

Finding a suitable internship is difficult for many students, especially those from rural areas or without proper guidance. InternPath solves this by:

Analyzing the student's profile

Matching it with real internship descriptions

Providing the best 5 opportunities

Showing why the internship is suitable

Highlighting skill gaps

Suggesting learning platforms

Generating a resume PDF

The aim is to provide personalized recommendations, not generic lists.

✨ Key Features
🔍 AI Recommendation Engine

Uses TF-IDF + Cosine Similarity

Multi-factor scoring:

Skills

Domain

Interests

Location

Education

Returns Top 5 most relevant internships

🎯 Skill Gap Analysis

Identifies missing skills

Suggests free learning resources:

NPTEL

SWAYAM

freeCodeCamp

YouTube

📄 Resume Generator

Creates a clean PDF resume

Based on the user’s profile

Instant download

🗣️ Accessibility (Upcoming)

Voice input

Multi-language support

SMS fallback system for offline usability

🛠️ Tech Stack

Frontend

React

Vite

Tailwind CSS

React Router

Backend

FastAPI

Python

scikit-learn

Uvicorn

ReportLab (for PDF generation)

Machine Learning

TF-IDF Vectorizer

Cosine Similarity

Content-based filtering

🚀 Installation & Setup
1️⃣ Clone the Repo
git clone https://github.com/ilakiya-tech/sih.git
cd sih

2️⃣ Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000


Backend runs at:
👉 http://localhost:8000

3️⃣ Frontend Setup

Open a NEW terminal:

cd sih
npm install
npm run dev


Frontend runs at:
👉 http://localhost:5173

🧪 Testing the System
🔹 Test API

Open:
👉 http://localhost:8000/docs

🔹 Test Recommendation

Open frontend

Fill your profile

Click “Get Recommendations”

You will see:

Match percentage

Company details

Skill gaps

Learning links

🔹 Test Resume Generation

Click “Generate Resume” to instantly download a PDF.

📊 How the Matching Works

The engine creates a score based on:

Skill Match       → 40%
Domain Match      → 25%
Interest Match    → 15%
Location Match    → 10%
Education Match   → 10%


TF-IDF + cosine similarity is used to compare student text with internship descriptions.

Finally, the system returns Top 5 internships with explanations.

🎯 Why Our Solution is Unique

Transparent AI (explains why a student got a match)

Skill gap insights

Free learning resource suggestions

Resume generator

Planned support for:

Voice input

Multi-language

SMS fallback

Our goal is to make internship discovery simple, accessible, and personalized.

👥 Team

Team Glitch – Smart India Hackathon 2025

Problem Statement: AI-based Internship Recommendation (SIH25034)

Theme: Smart Education

🗺️ Future Roadmap
Phase 1 (Done)

AI model

Recommendation engine

Resume builder

Frontend UI

Phase 2 (In progress)

Voice input

Vernacular support

SMS fallback

Phase 3 (Planned)

Real-time internship posting

Student login

Company dashboard

Analytics and reporting

Mobile app

🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a new branch
3. Commit your changes
4. Push and create a pull request

📞 Support

For queries or improvements, open an issue in the repository.

⭐ Made with ❤️ for SIH 2025

If you find this project helpful, please ⭐ the repo.