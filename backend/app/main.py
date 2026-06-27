from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.database import Base, engine
from app.routers import auth, dashboard, profile, recommendations
from app.services.chroma import get_chroma_service

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    chroma = get_chroma_service()
    count = chroma.seed_if_empty()
    print(f"ChromaDB seeded with {count} internship embeddings")
    yield


app = FastAPI(
    title="InternPath API",
    description="AI-powered internship recommendation system with semantic search",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(profile.router, prefix="/api")
app.include_router(recommendations.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/api/health")
def health():
    chroma = get_chroma_service()
    return {
        "status": "ok",
        "embeddings": chroma.collection.count(),
        "gemini_configured": bool(settings.gemini_api_key),
    }
