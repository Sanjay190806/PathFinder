import sqlite3

def migrate():
    conn = sqlite3.connect("pathfinder.db")
    cursor = conn.cursor()

    # 1. Assessment table new columns
    cursor.execute("PRAGMA table_info(assessments);")
    existing_assessment_cols = {c[1] for c in cursor.fetchall()}

    assessment_cols = [
        ("allowed_pause", "BOOLEAN DEFAULT 1"),
        ("max_pause_seconds", "INTEGER DEFAULT 600"),
        ("max_pauses_allowed", "INTEGER DEFAULT 2"),
        ("navigation_policy", "VARCHAR(50) DEFAULT 'FREE_NAVIGATION'"),
        ("submission_policy", "VARCHAR(50) DEFAULT 'AUTO_SUBMIT_ON_EXPIRE'"),
    ]

    for col_name, col_def in assessment_cols:
        if col_name not in existing_assessment_cols:
            cursor.execute(f"ALTER TABLE assessments ADD COLUMN {col_name} {col_def};")
            print(f"Added column {col_name} to assessments table.")

    # 2. AssessmentSession table new columns
    cursor.execute("PRAGMA table_info(assessment_sessions);")
    existing_session_cols = {c[1] for c in cursor.fetchall()}

    session_cols = [
        ("attempt_number", "INTEGER DEFAULT 1"),
        ("session_version", "INTEGER DEFAULT 1"),
        ("last_activity_at", "DATETIME"),
        ("paused_at", "DATETIME"),
        ("total_paused_seconds", "INTEGER DEFAULT 0"),
        ("max_pause_seconds", "INTEGER DEFAULT 600"),
        ("pause_count", "INTEGER DEFAULT 0"),
        ("max_pauses_allowed", "INTEGER DEFAULT 2"),
        ("navigation_policy", "VARCHAR(50) DEFAULT 'FREE_NAVIGATION'"),
        ("audit_events", "JSON DEFAULT '[]'"),
        ("result_summary", "JSON"),
    ]

    for col_name, col_def in session_cols:
        if col_name not in existing_session_cols:
            cursor.execute(f"ALTER TABLE assessment_sessions ADD COLUMN {col_name} {col_def};")
            print(f"Added column {col_name} to assessment_sessions table.")

    conn.commit()
    conn.close()
    print("Migration for Phase 10 Stage 4 completed successfully!")

if __name__ == "__main__":
    migrate()
