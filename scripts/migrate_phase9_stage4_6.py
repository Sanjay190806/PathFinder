import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "..", "pathfinder.db")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Check & add preferred_language to learner_profiles
    cursor.execute("PRAGMA table_info(learner_profiles);")
    profile_cols = [row[1] for row in cursor.fetchall()]
    if "preferred_language" not in profile_cols:
        print("Adding preferred_language to learner_profiles...")
        cursor.execute("ALTER TABLE learner_profiles ADD COLUMN preferred_language VARCHAR(50) DEFAULT 'English';")

    # 2. Check & add Stage 5 & 6 columns to learning_resources
    cursor.execute("PRAGMA table_info(learning_resources);")
    resource_cols = [row[1] for row in cursor.fetchall()]

    new_resource_cols = [
        ("language", "VARCHAR(50) DEFAULT 'English'"),
        ("price_type", "VARCHAR(50) DEFAULT 'GENUINELY_FREE'"),
        ("learning_cost", "FLOAT DEFAULT 0.0"),
        ("certificate_cost", "VARCHAR(50) DEFAULT 'free'"),
        ("subscription_required", "BOOLEAN DEFAULT 0"),
        ("free_learning", "BOOLEAN DEFAULT 1"),
        ("free_certificate", "BOOLEAN DEFAULT 0"),
        ("verification_status", "VARCHAR(50) DEFAULT 'VERIFIED'"),
        ("verification_method", "VARCHAR(50) DEFAULT 'curated_catalog'"),
        ("last_verified_at", "DATETIME"),
        ("canonical_url", "VARCHAR(500)"),
        ("source", "VARCHAR(100) DEFAULT 'curated_catalog'"),
        ("source_tier", "INTEGER DEFAULT 1"),
        ("external_id", "VARCHAR(100)")
    ]

    for col_name, col_def in new_resource_cols:
        if col_name not in resource_cols:
            print(f"Adding {col_name} to learning_resources...")
            cursor.execute(f"ALTER TABLE learning_resources ADD COLUMN {col_name} {col_def};")

    conn.commit()
    conn.close()
    print("Migration for Phase 9 Stages 4-6 completed successfully.")

if __name__ == "__main__":
    migrate()
