import json

from app.schemas import InternshipOut, RecommendationResponse
from app.services.chroma import get_chroma_service
from app.services.embedding import profile_to_document
from app.services.gemini import explain_match, generate_roadmap
from app.services.skill_gap import analyze_skill_gap, profile_completion_score


def profile_dict_from_model(profile) -> dict:
    domains = []
    if profile and profile.domains:
        try:
            domains = json.loads(profile.domains)
        except json.JSONDecodeError:
            domains = [part.strip() for part in profile.domains.split(",") if part.strip()]
    return {
        "education": profile.education if profile else "",
        "skills": profile.skills if profile else "",
        "interests": profile.interests if profile else "",
        "domains": domains,
        "location": profile.location if profile else "",
    }


def build_internship_out(chroma, internship_id: str, similarity: float, profile: dict, with_ai: bool = True) -> InternshipOut | None:
    internship = chroma.get_internship(internship_id)
    if not internship:
        return None

    from app.services.embedding import compute_skill_overlap, parse_skills

    user_skills = parse_skills(profile.get("skills", ""))
    matched, missing, skill_match_pct = compute_skill_overlap(user_skills, internship["required_skills"])
    combined_match = round((similarity * 0.6 + (skill_match_pct / 100) * 0.4) * 100, 1)
    explanation = ""
    if with_ai:
        explanation = explain_match(profile, internship, matched, missing)

    return InternshipOut(
        id=internship["id"],
        title=internship["title"],
        company=internship["company"],
        location=internship["location"],
        domain=internship["domain"],
        description=internship["description"],
        required_skills=internship["required_skills"],
        preferred_skills=internship.get("preferred_skills", []),
        stipend=internship["stipend"],
        duration=internship["duration"],
        work_mode=internship["work_mode"],
        education_level=internship["education_level"],
        similarity_score=round(similarity, 4),
        match_percentage=combined_match,
        matched_skills=matched,
        missing_skills=missing,
        ai_explanation=explanation,
    )


def recommend_for_profile(profile, top_k: int = 10, min_similarity: float = 0.65) -> RecommendationResponse:
    chroma = get_chroma_service()
    profile_data = profile_dict_from_model(profile)
    query = profile_to_document(profile_data)
    
    # Map frontend domains to dataset domains
    domain_mapping = {
        "tech": ["Software Engineering", "Web Development", "Data Science", "Machine Learning"],
        "marketing": ["Digital Marketing"],
        "design": ["UI/UX Design"],
        "business": ["General", "Product Management", "Human Resources"],
        "finance": ["Finance"],
        "healthcare": ["General"] 
    }
    
    target_domains = []
    for d in profile_data.get("domains", []):
        d_lower = d.lower()
        if d_lower in domain_mapping:
            target_domains.extend(domain_mapping[d_lower])
        else:
            # Maybe the AI parsing returned exact strings
            target_domains.append(d)
            
    target_domains = list(set(target_domains))
    
    filters = {}
    if target_domains:
        if len(target_domains) == 1:
            filters["domain"] = target_domains[0]
        else:
            filters["domain"] = {"$in": target_domains}
            
    search_results = chroma.search(query, top_k=top_k, filters=filters if filters else None)

    recommendations: list[InternshipOut] = []
    for internship_id, similarity in search_results:
        if similarity < min_similarity:
            continue
        item = build_internship_out(chroma, internship_id, similarity, profile_data, with_ai=True)
        if item:
            recommendations.append(item)

    all_required: list[str] = []
    for rec in recommendations[:5]:
        all_required.extend(rec.required_skills)
    unique_required = list(dict.fromkeys(all_required))

    roadmap = generate_roadmap(profile_data, list(dict.fromkeys(
        skill for rec in recommendations[:5] for skill in rec.missing_skills
    )), [rec.model_dump() for rec in recommendations[:3]])

    skill_gap = analyze_skill_gap(profile_data, unique_required, roadmap=roadmap)

    return RecommendationResponse(
        recommendations=recommendations,
        skill_gap=skill_gap,
        profile_completion=profile_completion_score(profile_data),
    )
