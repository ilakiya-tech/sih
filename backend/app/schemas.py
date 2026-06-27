from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    full_name: str = Field(min_length=2)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    created_at: datetime

    model_config = {"from_attributes": True}


class ProfileUpdate(BaseModel):
    education: str = ""
    skills: str = ""
    interests: str = ""
    domains: list[str] = Field(default_factory=list)
    location: str = ""


class ProfileOut(ProfileUpdate):
    updated_at: datetime | None = None
    completion_score: int = 0

    model_config = {"from_attributes": True}


class CourseSuggestion(BaseModel):
    platform: Literal["NPTEL", "Coursera", "YouTube"]
    title: str
    url: str
    skill: str


class SkillGapItem(BaseModel):
    skill: str
    status: Literal["matched", "missing", "partial"]
    user_has: bool


class SkillGapAnalysis(BaseModel):
    matched_skills: list[str]
    missing_skills: list[str]
    match_percentage: float
    skill_details: list[SkillGapItem]
    course_suggestions: list[CourseSuggestion]
    roadmap: list[str]


class InternshipOut(BaseModel):
    id: str
    title: str
    company: str
    location: str
    domain: str
    description: str
    required_skills: list[str]
    preferred_skills: list[str] = Field(default_factory=list)
    stipend: str
    duration: str
    work_mode: str
    education_level: str
    similarity_score: float = 0.0
    match_percentage: float = 0.0
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    ai_explanation: str = ""


class RecommendationRequest(BaseModel):
    top_k: int = Field(default=10, ge=1, le=30)


class RecommendationResponse(BaseModel):
    recommendations: list[InternshipOut]
    skill_gap: SkillGapAnalysis
    profile_completion: int


class SavedInternshipCreate(BaseModel):
    internship_id: str


class ApplicationCreate(BaseModel):
    internship_id: str
    status: Literal["saved", "applied", "interviewing", "rejected", "accepted"] = "applied"
    notes: str = ""


class ApplicationUpdate(BaseModel):
    status: Literal["saved", "applied", "interviewing", "rejected", "accepted"]
    notes: str = ""


class ApplicationOut(BaseModel):
    id: int
    internship_id: str
    status: str
    notes: str
    updated_at: datetime
    internship: InternshipOut | None = None

    model_config = {"from_attributes": True}


class DashboardOut(BaseModel):
    profile_completion: int
    saved_count: int
    applications_count: int
    recent_recommendations_count: int
    saved_internships: list[InternshipOut]
    applications: list[ApplicationOut]
    status_breakdown: dict[str, int]
