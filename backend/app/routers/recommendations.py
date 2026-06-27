import json

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import RecommendationHistory, User, UserProfile
from app.schemas import RecommendationRequest, RecommendationResponse
from app.services.chroma import get_chroma_service
from app.services.recommender import build_internship_out, profile_dict_from_model, recommend_for_profile

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.post("", response_model=RecommendationResponse)
def get_recommendations(
    payload: RecommendationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile or not profile.skills.strip():
        raise HTTPException(status_code=400, detail="Complete your profile before requesting recommendations")

    response = recommend_for_profile(profile, top_k=payload.top_k)

    history = RecommendationHistory(
        user_id=current_user.id,
        query_summary=profile.skills[:500],
        results_json=json.dumps([item.model_dump() for item in response.recommendations[:10]]),
    )
    db.add(history)
    db.commit()

    return response


@router.get("/history", response_model=list[RecommendationResponse])
def recommendation_history(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    rows = (
        db.query(RecommendationHistory)
        .filter(RecommendationHistory.user_id == current_user.id)
        .order_by(RecommendationHistory.created_at.desc())
        .limit(5)
        .all()
    )
    history: list[RecommendationResponse] = []
    for row in rows:
        try:
            recommendations_data = json.loads(row.results_json)
            history.append(
                RecommendationResponse(
                    recommendations=recommendations_data,
                    skill_gap={
                        "matched_skills": [],
                        "missing_skills": [],
                        "match_percentage": 0,
                        "skill_details": [],
                        "course_suggestions": [],
                        "roadmap": [],
                    },
                    profile_completion=0,
                )
            )
        except json.JSONDecodeError:
            continue
    return history


@router.get("/internship/{internship_id}")
def get_internship_detail(
    internship_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    profile_data = profile_dict_from_model(profile)
    chroma = get_chroma_service()
    internship = chroma.get_internship(internship_id)
    if not internship:
        raise HTTPException(status_code=404, detail="Internship not found")
    return build_internship_out(chroma, internship_id, 0.0, profile_data, with_ai=True)
