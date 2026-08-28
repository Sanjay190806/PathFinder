import pytest
from backend.app.engine.embedding_service import EmbeddingService

def test_embedding_service_text_generation():
    svc = EmbeddingService()
    text = svc.create_resource_embedding_text(
        title="PyTorch Deep Learning",
        description="Comprehensive neural network guide",
        skills=["deep-learning", "python"],
        career_relevance=["ai-ml-engineer"],
        format_type="hands-on"
    )
    assert "PyTorch Deep Learning" in text
    assert "deep-learning, python" in text
    assert "ai-ml-engineer" in text

def test_embedding_service_vector_generation_and_validation():
    svc = EmbeddingService(dimension=128)
    res = svc.generate_embedding("Test content for embedding")
    
    assert "vector" in res
    assert "is_real_embedding" in res
    assert len(res["vector"]) == 128
    assert svc.validate_dimensions(res["vector"], 128) is True
    assert svc.validate_dimensions(res["vector"], 64) is False

def test_embedding_service_serialization():
    svc = EmbeddingService()
    vec = [0.1, 0.2, 0.3, 0.4]
    serialized = svc.serialize_embedding(vec)
    assert isinstance(serialized, str)
    deserialized = svc.deserialize_embedding(serialized)
    assert deserialized == [0.1, 0.2, 0.3, 0.4]
