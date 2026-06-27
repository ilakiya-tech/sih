from app.schemas import CourseSuggestion, SkillGapAnalysis, SkillGapItem
from app.services.courses import COURSE_CATALOG, DEFAULT_COURSES
from app.services.embedding import compute_skill_overlap, normalize_skill, parse_skills


def suggest_courses(missing_skills: list[str]) -> list[CourseSuggestion]:
    suggestions: list[CourseSuggestion] = []
    seen: set[str] = set()

    for skill in missing_skills:
        key = normalize_skill(skill)
        courses = COURSE_CATALOG.get(key, [])
        for course in courses[:2]:
            dedupe_key = f"{course['platform']}:{course['title']}"
            if dedupe_key in seen:
                continue
            seen.add(dedupe_key)
            suggestions.append(
                CourseSuggestion(
                    platform=course["platform"],  # type: ignore[arg-type]
                    title=course["title"],
                    url=course["url"],
                    skill=skill,
                )
            )

    if not suggestions:
        for course in DEFAULT_COURSES:
            suggestions.append(
                CourseSuggestion(
                    platform=course["platform"],  # type: ignore[arg-type]
                    title=course["title"],
                    url=course["url"],
                    skill="general",
                )
            )
    return suggestions[:12]


def analyze_skill_gap(profile: dict, required_skills: list[str], roadmap: list[str] | None = None) -> SkillGapAnalysis:
    user_skills = parse_skills(profile.get("skills", ""))
    matched, missing, percentage = compute_skill_overlap(user_skills, required_skills)
    user_normalized = {normalize_skill(skill) for skill in user_skills}

    details = [
        SkillGapItem(
            skill=skill,
            status="matched" if skill in matched else "missing",
            user_has=normalize_skill(skill) in user_normalized
            or any(normalize_skill(skill) in user_skill or user_skill in normalize_skill(skill) for user_skill in user_normalized),
        )
        for skill in required_skills
    ]

    return SkillGapAnalysis(
        matched_skills=matched,
        missing_skills=missing,
        match_percentage=percentage,
        skill_details=details,
        course_suggestions=suggest_courses(missing),
        roadmap=roadmap or [],
    )


def profile_completion_score(profile: dict | None) -> int:
    if not profile:
        return 0
    fields = [
        bool(profile.get("education")),
        bool(profile.get("skills", "").strip()),
        bool(profile.get("interests", "").strip()),
        bool(profile.get("domains")),
        bool(profile.get("location", "").strip()),
    ]
    return int((sum(fields) / len(fields)) * 100)
