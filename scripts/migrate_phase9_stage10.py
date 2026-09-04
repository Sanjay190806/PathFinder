import sqlite3

def migrate():
    conn = sqlite3.connect('pathfinder.db')
    cursor = conn.cursor()

    # 1. Create preparation_history_records table if not exists
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS preparation_history_records (
        id VARCHAR(36) PRIMARY KEY,
        learner_id VARCHAR(36) NOT NULL,
        career_id VARCHAR(64),
        opportunity_id VARCHAR(36),
        overall_score FLOAT NOT NULL DEFAULT 0.0,
        dimension_scores JSON NOT NULL,
        identified_gaps JSON NOT NULL,
        recommended_actions JSON NOT NULL,
        recorded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(learner_id) REFERENCES users(id) ON DELETE CASCADE
    );
    """)

    # 2. Add opportunity_id and status columns to mock_interview_sessions if not existing
    cursor.execute("PRAGMA table_info(mock_interview_sessions);")
    interview_cols = {row[1] for row in cursor.fetchall()}

    if "opportunity_id" not in interview_cols:
        print("Adding column opportunity_id to mock_interview_sessions...")
        cursor.execute("ALTER TABLE mock_interview_sessions ADD COLUMN opportunity_id VARCHAR(36);")

    if "status" not in interview_cols:
        print("Adding column status to mock_interview_sessions...")
        cursor.execute("ALTER TABLE mock_interview_sessions ADD COLUMN status VARCHAR(50) DEFAULT 'in_progress';")

    conn.commit()
    conn.close()
    print("Migration Phase 9 Stage 10 complete.")

if __name__ == "__main__":
    migrate()
