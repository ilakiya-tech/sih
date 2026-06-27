import json
import re
from functools import lru_cache
from pathlib import Path

from sentence_transformers import SentenceTransformer

from app.config import get_settings

settings = get_settings()
DATA_PATH = Path(__file__).resolve().parents[2] / "data" / "internships.json"


@lru_cache
def get_embedding_model() -> SentenceTransformer:
    return SentenceTransformer(settings.embedding_model)


def normalize_skill(skill: str) -> str:
    return re.sub(r"\s+", " ", skill.strip().lower())


def parse_skills(text: str) -> list[str]:
    if not text:
        return []
    parts = re.split(r"[,;/|]", text)
    return [skill.strip() for skill in parts if skill.strip()]


def load_internships() -> list[dict]:
    if not DATA_PATH.exists():
        return []
    with DATA_PATH.open(encoding="utf-8") as handle:
        return json.load(handle)


def internship_to_document(internship: dict) -> str:
    required = ", ".join(internship.get("required_skills", []))
    preferred = ", ".join(internship.get("preferred_skills", []))
    return (
        f"Title: {internship['title']}. "
        f"Company: {internship['company']}. "
        f"Domain: {internship['domain']}. "
        f"Location: {internship['location']}. "
        f"Work mode: {internship['work_mode']}. "
        f"Description: {internship['description']}. "
        f"Required skills: {required}. "
        f"Preferred skills: {preferred}. "
        f"Education: {internship['education_level']}."
    )


def profile_to_document(profile: dict) -> str:
    domains = ", ".join(profile.get("domains", []))
    return (
        f"Education: {profile.get('education', '')}. "
        f"Skills: {profile.get('skills', '')}. "
        f"Interests: {profile.get('interests', '')}. "
        f"Preferred domains: {domains}. "
        f"Location preference: {profile.get('location', '')}."
    )


def compute_skill_overlap(user_skills: list[str], required_skills: list[str]) -> tuple[list[str], list[str], float]:
    user_normalized = {normalize_skill(skill) for skill in user_skills}
    matched: list[str] = []
    missing: list[str] = []

    for skill in required_skills:
        normalized = normalize_skill(skill)
        if normalized in user_normalized:
            matched.append(skill)
            continue
        if any(normalized in user_skill or user_skill in normalized for user_skill in user_normalized):
            matched.append(skill)
        else:
            missing.append(skill)

    total = len(required_skills) or 1
    percentage = round((len(matched) / total) * 100, 1)
    return matched, missing, percentage
