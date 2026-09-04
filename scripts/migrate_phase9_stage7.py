import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "pathfinder.db")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS learner_plans (
        id VARCHAR(36) PRIMARY KEY,
        profile_id VARCHAR(36) NOT NULL,
        plan_version INTEGER DEFAULT 1,
        daily_plan JSON NOT NULL,
        weekly_plan JSON NOT NULL,
        monthly_plan JSON,
        milestone_plan JSON NOT NULL,
        overflow_hours FLOAT DEFAULT 0.0,
        reason VARCHAR(500) DEFAULT 'Initial baseline plan generation',
        source_signals JSON,
        created_at DATETIME,
        FOREIGN KEY (profile_id) REFERENCES learner_profiles(id) ON DELETE CASCADE
    );
    """)

    cursor.execute("CREATE INDEX IF NOT EXISTS ix_learner_plans_profile_id ON learner_plans(profile_id);")

    conn.commit()
    conn.close()
    print("Migration for Phase 9 Stage 7 (learner_plans) completed successfully.")

if __name__ == "__main__":
    migrate()
