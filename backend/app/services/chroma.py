import chromadb
from chromadb.config import Settings as ChromaSettings

from app.config import get_settings
from app.services.embedding import get_embedding_model, internship_to_document, load_internships

settings = get_settings()
COLLECTION_NAME = "internships"


class ChromaService:
    def __init__(self) -> None:
        self.client = chromadb.PersistentClient(
            path=settings.chroma_persist_dir,
            settings=ChromaSettings(anonymized_telemetry=False),
        )
        self.collection = self.client.get_or_create_collection(
            name=COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
        self.model = get_embedding_model()
        self._internship_map: dict[str, dict] = {}

    def refresh_internship_map(self) -> None:
        self._internship_map = {item["id"]: item for item in load_internships()}

    def get_internship(self, internship_id: str) -> dict | None:
        if not self._internship_map:
            self.refresh_internship_map()
        return self._internship_map.get(internship_id)

    def seed_if_empty(self) -> int:
        internships = load_internships()
        if not internships:
            return 0

        self.refresh_internship_map()
        current_count = self.collection.count()
        if current_count >= len(internships):
            return current_count

        if current_count > 0:
            existing = self.collection.get(include=[])
            if existing.get("ids"):
                self.collection.delete(ids=existing["ids"])
        documents = [internship_to_document(item) for item in internships]
        embeddings = self.model.encode(documents, show_progress_bar=True).tolist()
        ids = [item["id"] for item in internships]
        metadatas = [
            {
                "source": "internpath",
                "title": item["title"][:200],
                "company": item["company"][:200],
                "domain": item["domain"][:100],
            }
            for item in internships
        ]
        batch_size = 100
        for start in range(0, len(ids), batch_size):
            end = start + batch_size
            self.collection.add(
                ids=ids[start:end],
                documents=documents[start:end],
                embeddings=embeddings[start:end],
                metadatas=metadatas[start:end],
            )
        return len(ids)

    def search(self, query_text: str, top_k: int = 10) -> list[tuple[str, float]]:
        query_embedding = self.model.encode([query_text]).tolist()
        results = self.collection.query(query_embeddings=query_embedding, n_results=top_k)
        ids = results.get("ids", [[]])[0]
        distances = results.get("distances", [[]])[0]
        scored: list[tuple[str, float]] = []
        for internship_id, distance in zip(ids, distances):
            similarity = max(0.0, 1.0 - float(distance))
            scored.append((internship_id, similarity))
        return scored


_chroma_service: ChromaService | None = None


def get_chroma_service() -> ChromaService:
    global _chroma_service
    if _chroma_service is None:
        _chroma_service = ChromaService()
    return _chroma_service
