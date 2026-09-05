import sqlite3

def migrate():
    conn = sqlite3.connect("pathfinder.db")
    cursor = conn.cursor()

    # 1. Assessment table new columns
    cursor.execute("PRAGMA table_info(assessments);")
    existing_assessment_cols = {c[1] for c in cursor.fetchall()}

    assessment_cols = [
        ("integrity_monitoring_policy", "VARCHAR(50) DEFAULT 'WARNING_ONLY'"),
        ("gadget_detection_enabled", "BOOLEAN DEFAULT 1"),
        ("monitoring_consent_required", "BOOLEAN DEFAULT 1"),
    ]

    for col_name, col_def in assessment_cols:
        if col_name not in existing_assessment_cols:
            cursor.execute(f"ALTER TABLE assessments ADD COLUMN {col_name} {col_def};")
            print(f"Added column {col_name} to assessments table.")

    # 2. AssessmentSession table new columns
    cursor.execute("PRAGMA table_info(assessment_sessions);")
    existing_session_cols = {c[1] for c in cursor.fetchall()}

    session_cols = [
        ("monitoring_consent", "VARCHAR(50) DEFAULT 'MONITORING_CONSENT_REQUIRED'"),
        ("monitoring_started_at", "DATETIME"),
        ("monitoring_ended_at", "DATETIME"),
    ]

    for col_name, col_def in session_cols:
        if col_name not in existing_session_cols:
            cursor.execute(f"ALTER TABLE assessment_sessions ADD COLUMN {col_name} {col_def};")
            print(f"Added column {col_name} to assessment_sessions table.")

    # 3. Create assessment_integrity_events table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assessment_integrity_events (
        id VARCHAR(36) PRIMARY KEY,
        session_id VARCHAR(36) NOT NULL REFERENCES assessment_sessions(id) ON DELETE CASCADE,
        profile_id VARCHAR(36) NOT NULL REFERENCES learner_profiles(id) ON DELETE CASCADE,
        assessment_id VARCHAR(36) REFERENCES assessments(id) ON DELETE CASCADE,
        event_type VARCHAR(50) NOT NULL,
        timestamp DATETIME NOT NULL,
        duration FLOAT DEFAULT 0.0,
        confidence FLOAT,
        severity VARCHAR(20) DEFAULT 'INFO',
        source VARCHAR(50) DEFAULT 'BROWSER_CAMERA',
        metadata_minimized JSON DEFAULT '{}',
        created_at DATETIME
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_integrity_session_id ON assessment_integrity_events (session_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_integrity_profile_id ON assessment_integrity_events (profile_id);")
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_integrity_event_type ON assessment_integrity_events (event_type);")
    print("Ensured assessment_integrity_events table and indexes exist.")

    conn.commit()
    conn.close()
    print("Migration for Phase 10 Stages 5 & 6 completed successfully!")

if __name__ == "__main__":
    migrate()
