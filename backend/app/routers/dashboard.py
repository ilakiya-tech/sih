from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.dependencies import get_current_user
from app.models import Application, RecommendationHistory, SavedInternship, User, UserProfile
from app.schemas import (
    ApplicationCreate,
    ApplicationOut,
    ApplicationUpdate,
    DashboardOut,
    InternshipOut,
    SavedInternshipCreate,
)
from app.services.chroma import get_chroma_service
from app.services.recommender import build_internship_out, profile_dict_from_model
from app.services.skill_gap import profile_completion_score

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


def internship_details(db: Session, user: User, internship_id: str) -> InternshipOut | None:
    profile = db.query(UserProfile).filter(UserProfile.user_id == user.id).first()
    profile_data = profile_dict_from_model(profile)
    chroma = get_chroma_service()
    return build_internship_out(chroma, internship_id, 0.0, profile_data, with_ai=False)


@router.get("", response_model=DashboardOut)
def dashboard(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    profile = db.query(UserProfile).filter(UserProfile.user_id == current_user.id).first()
    profile_data = profile_dict_from_model(profile)

    saved_rows = (
        db.query(SavedInternship)
        .filter(SavedInternship.user_id == current_user.id)
        .order_by(SavedInternship.created_at.desc())
        .all()
    )
    application_rows = (
        db.query(Application)
        .filter(Application.user_id == current_user.id)
        .order_by(Application.updated_at.desc())
        .all()
    )
    recent_recs = (
        db.query(RecommendationHistory)
        .filter(RecommendationHistory.user_id == current_user.id)
        .count()
    )

    saved_internships: list[InternshipOut] = []
    for row in saved_rows:
        item = internship_details(db, current_user, row.internship_id)
        if item:
            saved_internships.append(item)

    applications: list[ApplicationOut] = []
    status_breakdown: dict[str, int] = {}
    for row in application_rows:
        status_breakdown[row.status] = status_breakdown.get(row.status, 0) + 1
        item = internship_details(db, current_user, row.internship_id)
        applications.append(
            ApplicationOut(
                id=row.id,
                internship_id=row.internship_id,
                status=row.status,
                notes=row.notes,
                updated_at=row.updated_at,
                internship=item,
            )
        )

    return DashboardOut(
        profile_completion=profile_completion_score(profile_data),
        saved_count=len(saved_rows),
        applications_count=len(application_rows),
        recent_recommendations_count=recent_recs,
        saved_internships=saved_internships,
        applications=applications,
        status_breakdown=status_breakdown,
    )


@router.post("/saved", status_code=201)
def save_internship(
    payload: SavedInternshipCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chroma = get_chroma_service()
    if not chroma.get_internship(payload.internship_id):
        raise HTTPException(status_code=404, detail="Internship not found")

    existing = (
        db.query(SavedInternship)
        .filter(
            SavedInternship.user_id == current_user.id,
            SavedInternship.internship_id == payload.internship_id,
        )
        .first()
    )
    if existing:
        return {"message": "Already saved"}

    db.add(SavedInternship(user_id=current_user.id, internship_id=payload.internship_id))
    db.commit()
    return {"message": "Saved"}


@router.delete("/saved/{internship_id}")
def unsave_internship(
    internship_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    row = (
        db.query(SavedInternship)
        .filter(
            SavedInternship.user_id == current_user.id,
            SavedInternship.internship_id == internship_id,
        )
        .first()
    )
    if row:
        db.delete(row)
        db.commit()
    return {"message": "Removed"}


@router.post("/applications", response_model=ApplicationOut, status_code=201)
def create_application(
    payload: ApplicationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    chroma = get_chroma_service()
    if not chroma.get_internship(payload.internship_id):
        raise HTTPException(status_code=404, detail="Internship not found")

    application = Application(
        user_id=current_user.id,
        internship_id=payload.internship_id,
        status=payload.status,
        notes=payload.notes,
    )
    db.add(application)
    db.commit()
    db.refresh(application)
    internship = internship_details(db, current_user, payload.internship_id)
    return ApplicationOut(
        id=application.id,
        internship_id=application.internship_id,
        status=application.status,
        notes=application.notes,
        updated_at=application.updated_at,
        internship=internship,
    )


@router.patch("/applications/{application_id}", response_model=ApplicationOut)
def update_application(
    application_id: int,
    payload: ApplicationUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    application = (
        db.query(Application)
        .filter(Application.id == application_id, Application.user_id == current_user.id)
        .first()
    )
    if not application:
        raise HTTPException(status_code=404, detail="Application not found")

    application.status = payload.status
    application.notes = payload.notes
    db.commit()
    db.refresh(application)
    internship = internship_details(db, current_user, application.internship_id)
    return ApplicationOut(
        id=application.id,
        internship_id=application.internship_id,
        status=application.status,
        notes=application.notes,
        updated_at=application.updated_at,
        internship=internship,
    )
