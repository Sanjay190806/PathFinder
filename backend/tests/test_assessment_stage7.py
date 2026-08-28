import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_assessment_list_and_question_structure():
    response = client.get("/api/v1/assessment")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0

    first_assessment = data[0]
    assert "id" in first_assessment
    assert "title" in first_assessment
    assert "questions" in first_assessment
    assert len(first_assessment["questions"]) > 0

    q = first_assessment["questions"][0]
    assert "id" in q
    assert "skill_id" in q
    assert "skill_name" in q
    assert "question_text" in q
    assert "options" in q
    assert len(q["options"]) >= 2

def test_assessment_submit_with_confidence_updates():
    # Login as demo user
    demo_res = client.post("/api/v1/demo/login")
    assert demo_res.status_code == 200
    token = demo_res.json()["access_token"]

    # Get assessments
    assessments_res = client.get("/api/v1/assessment")
    assessment_id = assessments_res.json()[0]["id"]
    questions = assessments_res.json()[0]["questions"]

    # Prepare answers
    answers = [{"question_id": q["id"], "selected_option_index": 0} for q in questions]

    # Submit assessment
    submit_res = client.post(
        "/api/v1/assessment/submit",
        json={"assessment_id": assessment_id, "answers": answers},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert submit_res.status_code == 200
    result = submit_res.json()

    assert "total_questions" in result
    assert "correct_count" in result
    assert "score_percentage" in result
    assert "skill_confidence_updates" in result
    assert "adaptation_triggered" in result
    assert result["total_questions"] == len(questions)
    assert len(result["skill_confidence_updates"]) == len(questions)

    # Verify each update has skill, is_correct, old_confidence, new_confidence
    for u in result["skill_confidence_updates"]:
        assert "skill" in u
        assert "is_correct" in u
        assert "old_confidence" in u
        assert "new_confidence" in u
