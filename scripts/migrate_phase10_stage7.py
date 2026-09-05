import sqlite3

def migrate():
    conn = sqlite3.connect("pathfinder.db")
    cursor = conn.cursor()

    # 1. AssessmentSession table Stage 7 columns
    cursor.execute("PRAGMA table_info(assessment_sessions);")
    existing_session_cols = {c[1] for c in cursor.fetchall()}

    session_cols = [
        ("integrity_state", "VARCHAR(50) DEFAULT 'NORMAL'"),
        ("action_instruction", "VARCHAR(50) DEFAULT 'CONTINUE'"),
        ("warning_count", "INTEGER DEFAULT 0"),
        ("last_warning_issued_at", "DATETIME"),
        ("active_warning", "JSON"),
        ("warning_history", "JSON DEFAULT '[]'"),
        ("review_status", "VARCHAR(50) DEFAULT 'NOT_APPLICABLE'"),
    ]

    for col_name, col_def in session_cols:
        if col_name not in existing_session_cols:
            cursor.execute(f"ALTER TABLE assessment_sessions ADD COLUMN {col_name} {col_def};")
            print(f"Added column {col_name} to assessment_sessions table.")

    # 2. Create assessment_integrity_policies table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS assessment_integrity_policies (
        id VARCHAR(36) PRIMARY KEY,
        assessment_id VARCHAR(36) NOT NULL UNIQUE REFERENCES assessments(id) ON DELETE CASCADE,
        monitoring_required BOOLEAN DEFAULT 1,
        camera_required BOOLEAN DEFAULT 1,
        allowed_warning_count INTEGER DEFAULT 3,
        warning_cooldown_seconds INTEGER DEFAULT 30,
        event_thresholds JSON DEFAULT '{}',
        escalation_rules JSON DEFAULT '{}',
        review_required_threshold INTEGER DEFAULT 4,
        invalidation_threshold INTEGER DEFAULT 0,
        auto_pause_on_interruption BOOLEAN DEFAULT 1,
        created_at DATETIME,
        updated_at DATETIME
    );
    """)
    cursor.execute("CREATE INDEX IF NOT EXISTS ix_integrity_policy_assessment_id ON assessment_integrity_policies (assessment_id);")
    print("Ensured assessment_integrity_policies table and index exist.")

    conn.commit()
    conn.close()
    print("Phase 10 Stage 7 database migration completed successfully.")

if __name__ == "__main__":
    migrate()
