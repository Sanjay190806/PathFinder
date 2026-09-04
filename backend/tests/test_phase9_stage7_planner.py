import pytest
from fastapi.testclient import TestClient
from backend.app.main import app
from backend.app.planner.priority_engine import PriorityEngine
from backend.app.planner.schedule_allocator import ScheduleAllocator
from backend.app.planner.planner_engine import PlannerEngine
from backend.app.database import SessionLocal

client = TestClient(app)

def test_stage7_priority_engine_rules():
    # 1. Mandatory prerequisite blocker -> Critical
    p1 = PriorityEngine.calculate_task_priority(
        skill_slug="python",
        is_prerequisite_blocker=True,
        is_decaying=False,
        is_critical_gap=True
    )
    assert p1 == "Critical"

    # 2. Severe decay on foundational skill -> Critical
    p2 = PriorityEngine.calculate_task_priority(
        skill_slug="sql",
        is_prerequisite_blocker=False,
        is_decaying=True,
        career_relevance_score=0.9
    )
    assert p2 == "Critical"

    # 3. Core career skill gap -> High
    p3 = PriorityEngine.calculate_task_priority(
        skill_slug="transformers",
        is_prerequisite_blocker=False,
        is_decaying=False,
        is_critical_gap=True
    )
    assert p3 == "High"

    # 4. Elective -> Low
    p4 = PriorityEngine.calculate_task_priority(
        skill_slug="optional-tool",
        is_prerequisite_blocker=False,
        is_decaying=False,
        is_critical_gap=False,
        career_relevance_score=0.3
    )
    assert p4 == "Low"

def test_stage7_schedule_allocator_budget_and_overflow():
    candidate_tasks = [
        {"title": "Task 1", "estimated_minutes": 180, "priority": "Critical"}, # 3h
        {"title": "Task 2", "estimated_minutes": 240, "priority": "High"},     # 4h
        {"title": "Task 3", "estimated_minutes": 180, "priority": "Medium"},   # 3h
        {"title": "Task 4", "estimated_minutes": 240, "priority": "Low"}       # 4h (Total 14h)
    ]

    # Learner weekly budget is 10 hours
    allocated, overflow_hours, explanation = ScheduleAllocator.allocate_workload(
        weekly_hours_budget=10.0,
        candidate_tasks=candidate_tasks
    )

    # 3h + 4h + 3h = 10h packed exactly
    assert len(allocated) == 3
    assert overflow_hours == 4.0
    assert "deferred" in explanation.lower()
    assert all(t["priority"] in ("Critical", "High", "Medium") for t in allocated)

def test_stage7_authenticated_planner_api():
    # 1. Unauthenticated requests blocked
    assert client.get("/api/v1/planner/today").status_code == 401
    assert client.get("/api/v1/planner/week").status_code == 401
    assert client.get("/api/v1/planner/next-milestone").status_code == 401
    assert client.post("/api/v1/planner/recalculate").status_code == 401

    # 2. Login demo user
    login_res = client.post("/api/v1/demo/login")
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 3. GET /api/v1/planner/today
    today_res = client.get("/api/v1/planner/today", headers=headers)
    assert today_res.status_code == 200
    today_data = today_res.json()
    assert "total_planned_minutes" in today_data
    assert "items" in today_data
    assert len(today_data["items"]) > 0
    first_item = today_data["items"][0]
    assert "priority" in first_item
    assert "reason" in first_item

    # 4. GET /api/v1/planner/week
    week_res = client.get("/api/v1/planner/week", headers=headers)
    assert week_res.status_code == 200
    week_data = week_res.json()
    assert "days" in week_data
    assert len(week_data["days"]) == 7
    assert week_data["weekly_hours_budget"] > 0

    # 5. GET /api/v1/planner/next-milestone
    ms_res = client.get("/api/v1/planner/next-milestone", headers=headers)
    assert ms_res.status_code == 200
    ms_data = ms_res.json()
    assert "title" in ms_data
    assert "target_eta_days" in ms_data
    assert ms_data["target_eta_days"] > 0

    # 6. POST /api/v1/planner/recalculate triggers version increment
    recalc_res = client.post(
        "/api/v1/planner/recalculate",
        headers=headers,
        json={"reason": "Updated weekly availability to 12 hours"}
    )
    assert recalc_res.status_code == 200
    recalc_data = recalc_res.json()
    assert recalc_data["plan_version"] >= 2
    assert len(recalc_data["why_this_order"]) > 0

    # 7. GET /api/v1/planner/history
    hist_res = client.get("/api/v1/planner/history", headers=headers)
    assert hist_res.status_code == 200
    history = hist_res.json()
    assert len(history) >= 2
    assert history[0]["plan_version"] > history[1]["plan_version"]
