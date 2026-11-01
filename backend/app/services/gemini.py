import json

import google.generativeai as genai

from app.config import get_settings

settings = get_settings()


def _configure_gemini() -> bool:
    if not settings.gemini_api_key:
        return False
    genai.configure(api_key=settings.gemini_api_key)
    return True


def explain_match(profile: dict, internship: dict, matched_skills: list[str], missing_skills: list[str]) -> str:
    fallback = (
        f"This {internship['title']} role at {internship['company']} aligns with your "
        f"{internship['domain']} interests. Your skills in {', '.join(matched_skills[:4]) or 'your background'} "
        f"overlap with the role requirements. "
        f"{'Focus on ' + ', '.join(missing_skills[:3]) + ' to strengthen your application.' if missing_skills else 'You meet most required skills.'}"
    )
    if not _configure_gemini():
        return fallback

    prompt = (
        "You are an internship career coach. In 2-3 concise sentences, explain why this internship "
        "matches the student's profile. Be specific and encouraging.\n\n"
        f"Student profile: {json.dumps(profile)}\n"
        f"Internship: {json.dumps({k: internship[k] for k in ['title', 'company', 'domain', 'description', 'required_skills']})}\n"
        f"Matched skills: {matched_skills}\n"
        f"Missing skills: {missing_skills}"
    )
    try:
        model = genai.GenerativeModel(settings.gemini_model)
        response = model.generate_content(prompt)
        return response.text.strip() or fallback
    except Exception:
        return fallback


def generate_roadmap(profile: dict, missing_skills: list[str], top_internships: list[dict]) -> list[str]:
    fallback = [
        f"Strengthen {skill} with a structured 4-week learning plan." for skill in missing_skills[:5]
    ] or [
        "Polish your portfolio with 2 projects aligned to your target domain.",
        "Tailor your resume keywords to each internship description.",
        "Practice behavioral and technical interview questions weekly.",
    ]
    if not _configure_gemini():
        return fallback

    prompt = (
        "Create a personalized 5-step skill improvement roadmap for an Indian student seeking internships. "
        "Return ONLY a JSON array of short actionable strings.\n\n"
        f"Profile: {json.dumps(profile)}\n"
        f"Skill gaps: {missing_skills}\n"
        f"Target roles: {[item['title'] for item in top_internships[:3]]}"
    )
    try:
        model = genai.GenerativeModel(settings.gemini_model)
        response = model.generate_content(prompt)
        text = response.text.strip()
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        steps = json.loads(text)
        if isinstance(steps, list):
            return [str(step) for step in steps[:6]]
    except Exception:
        pass
    return fallback


def parse_resume_text(text: str) -> dict:
    fallback = {
        "education": "",
        "skills": "",
        "interests": "",
        "domains": [],
        "location": ""
    }
    if not _configure_gemini():
        return fallback

    prompt = (
        "You are an AI resume parser. Extract the candidate's core details from the following resume text "
        "and return them STRICTLY as a JSON object with these keys: "
        "'education' (string: summary of degrees/colleges), "
        "'skills' (string: comma separated list of technical and soft skills), "
        "'interests' (string: summary of hobbies or career interests), "
        "'domains' (array of strings: e.g. ['Software Engineering', 'Data Science']), "
        "'location' (string: city, state, or country).\n\n"
        f"Resume text:\n{text[:5000]}"
    )
    try:
        model = genai.GenerativeModel(settings.gemini_model)
        response = model.generate_content(prompt)
        resp_text = response.text.strip()
        if resp_text.startswith("```"):
            resp_text = resp_text.split("```")[1]
            if resp_text.startswith("json"):
                resp_text = resp_text[4:]
        data = json.loads(resp_text)
        return {
            "education": str(data.get("education", "")),
            "skills": str(data.get("skills", "")),
            "interests": str(data.get("interests", "")),
            "domains": data.get("domains", []),
            "location": str(data.get("location", ""))
        }
    except Exception:
        return fallback
