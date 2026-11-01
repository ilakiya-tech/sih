import json
import io

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session
from pypdf import PdfReader

from app.database import get_db
from app.dependencies import get_current_user
from app.models import User, UserProfile
from app.schemas import ProfileOut, ProfileUpdate
from app.services.skill_gap import profile_completion_score
from app.services.gemini import parse_resume_text

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


@router.post("/upload-resume", response_model=ProfileOut)
async def upload_resume(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    try:
        content = await file.read()
        pdf = PdfReader(io.BytesIO(content))
        text = ""
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n"
        
        parsed_data = parse_resume_text(text)
        
        profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
        if not profile:
            profile = UserProfile(user_id=current_user.id)
            db.add(profile)

        profile.education = parsed_data.get("education", profile.education or "")
        profile.skills = parsed_data.get("skills", profile.skills or "")
        profile.interests = parsed_data.get("interests", profile.interests or "")
        profile.location = parsed_data.get("location", profile.location or "")
        
        if parsed_data.get("domains"):
            profile.domains = json.dumps(parsed_data["domains"])
            
        db.commit()
        db.refresh(profile)
        return serialize_profile(profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to process resume: {str(e)}")
