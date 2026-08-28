import json
import hashlib
import numpy as np
from typing import List, Dict, Any, Optional
from backend.app.core.config import settings
from backend.app.core.logger import logger

class EmbeddingService:
    def __init__(
        self,
        model_name: str = settings.EMBEDDING_MODEL,
        model_version: str = settings.EMBEDDING_MODEL_VERSION,
        dimension: int = settings.EMBEDDING_DIM
    ):
        self.model_name = model_name
        self.model_version = model_version
        self.dimension = dimension

    def create_resource_embedding_text(
        self,
        title: str,
        description: str,
        skills: List[str],
        career_relevance: List[str],
        format_type: str
    ) -> str:
        """
        Deterministic string formulation for resource embedding.
        """
        skills_str = ", ".join(skills) if skills else "General"
        goals_str = ", ".join(career_relevance) if career_relevance else "General"
        return f"{title}. {description}. Skills: {skills_str}. Goals: {goals_str}. Format: {format_type}."

    def create_learner_embedding_text(
        self,
        target_role: str,
        learning_objective: str,
        known_skills: List[str],
        target_skills: List[str],
        preferred_formats: List[str]
    ) -> str:
        """
        Deterministic string formulation for learner profile embedding.
        """
        known_str = ", ".join(known_skills) if known_skills else "None"
        target_str = ", ".join(target_skills) if target_skills else "None"
        fmt_str = ", ".join(preferred_formats) if preferred_formats else "Any"
        return f"Target Role: {target_role}. Objective: {learning_objective}. Known Skills: {known_str}. Target Skills: {target_str}. Preferred Formats: {fmt_str}."

    def generate_embedding(self, text: str) -> Dict[str, Any]:
        """
        Generates a vector embedding. If Google Gemini API is available and configured,
        generates live dense embedding; otherwise produces a deterministic local projected vector
        clearly flagged as is_real_embedding=False.
        """
        if settings.GEMINI_API_KEY:
            try:
                import google.generativeai as genai
                genai.configure(api_key=settings.GEMINI_API_KEY)
                result = genai.embed_content(
                    model=f"models/{self.model_name}",
                    content=text,
                    task_type="retrieval_document"
                )
                raw_vector = result.get('embedding', [])
                if raw_vector:
                    # Truncate or project to target dimension if needed
                    vec = np.array(raw_vector[:self.dimension], dtype=np.float32)
                    norm = np.linalg.norm(vec)
                    if norm > 0:
                        vec = vec / norm
                    return {
                        "vector": vec.tolist(),
                        "is_real_embedding": True,
                        "model": self.model_name,
                        "model_version": self.model_version,
                        "dimension": len(vec)
                    }
            except Exception as e:
                logger.warning(f"Live embedding generation failed ({e}), falling back to deterministic local representation.")

        # Deterministic local fallback representation (SHA-256 seed projection onto unit sphere)
        # Clearly marked is_real_embedding = False
        return self._generate_fallback_vector(text)

    def _generate_fallback_vector(self, text: str) -> Dict[str, Any]:
        # Hash text into deterministic pseudo-random pseudo-semantic vector
        seed = int(hashlib.sha256(text.encode('utf-8')).hexdigest()[:8], 16)
        rng = np.random.RandomState(seed)
        vec = rng.randn(self.dimension).astype(np.float32)
        norm = np.linalg.norm(vec)
        if norm > 0:
            vec = vec / norm

        return {
            "vector": vec.tolist(),
            "is_real_embedding": False,
            "model": "deterministic-fallback-projection",
            "model_version": "v1.0",
            "dimension": self.dimension
        }

    def serialize_embedding(self, vector: List[float]) -> str:
        return json.dumps(vector)

    def deserialize_embedding(self, data: Any) -> Optional[List[float]]:
        if data is None:
            return None
        if isinstance(data, list):
            return [float(x) for x in data]
        if isinstance(data, str):
            try:
                parsed = json.loads(data)
                if isinstance(parsed, list):
                    return [float(x) for x in parsed]
            except Exception:
                return None
        return None

    def validate_dimensions(self, vector: List[float], expected_dim: Optional[int] = None) -> bool:
        if not vector or not isinstance(vector, list):
            return False
        target_dim = expected_dim or self.dimension
        return len(vector) == target_dim
