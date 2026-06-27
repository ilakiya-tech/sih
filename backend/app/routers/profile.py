import json

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, UserProfile
from app.schemas import ProfileOut, ProfileUpdate
from app.services.skill_gap import profile_completion_score

router = APIRouter(prefix="/profile", tags=["profile"])


def serialize_profile(profile: UserProfile | None) -> ProfileOut:
    domains: list[str] = []
    if profile and profile.domains:
        try:
            domains = json.loads(profile.domains)
        except json.JSONDecodeError:
            domains = [part.strip() for part in profile.domains.split(",") if part.strip()]

    profile_data = {
        "education": profile.education if profile else "",
        "skills": profile.skills if profile else "",
        "interests": profile.interests if profile else "",
        "domains": domains,
        "location": profile.location if profile else "",
        "updated_at": profile.updated_at if profile else None,
    }
    return ProfileOut(**profile_data, completion_score=profile_completion_score(profile_data))


@router.get("", response_model=ProfileOut)
def get_profile(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    return serialize_profile(profile)


@router.put("", response_model=ProfileOut)
def upsert_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    if not profile:
        profile = UserProfile(user_id=current_user.id)
        db.add(profile)

    profile.education = payload.education
    profile.skills = payload.skills
    profile.interests = payload.interests
    profile.domains = json.dumps(payload.domains)
    profile.location = payload.location
    db.commit()
    db.refresh(profile)
    return serialize_profile(profile)
