import sys
from pathlib import Path

# Add project root to sys.path
ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from backend.app.database import engine, Base
import backend.app.models  # Ensure all models are registered
import sqlite3

def run_migration():
    print("Creating all tables if not exist...")
    Base.metadata.create_all(bind=engine)

    # In SQLite, create_all does not add columns to existing tables.
    # Check and add new columns to `assessments` and `assessment_questions`
    conn = sqlite3.connect("pathfinder.db")
    cursor = conn.cursor()

    # Columns for `assessments`
    cursor.execute("PRAGMA table_info(assessments)")
    existing_cols = {row[1] for row in cursor.fetchall()}
    print(f"Existing columns in assessments: {existing_cols}")

    new_assessment_cols = [
        ("course_id", "VARCHAR(36)"),
        ("syllabus_id", "VARCHAR(36)"),
        ("syllabus_version", "INTEGER"),
        ("blueprint_id", "VARCHAR(36)"),
        ("description", "TEXT"),
        ("assessment_type", "VARCHAR(50) DEFAULT 'STANDARD'"),
        ("duration_minutes", "INTEGER DEFAULT 60"),
        ("total_questions", "INTEGER DEFAULT 30"),
        ("total_marks", "FLOAT DEFAULT 100.0"),
        ("passing_score", "FLOAT DEFAULT 60.0"),
        ("attempt_limit", "INTEGER DEFAULT 3"),
        ("status", "VARCHAR(50) DEFAULT 'DRAFT'"),
        ("random_seed", "INTEGER"),
        ("created_at", "DATETIME"),
        ("updated_at", "DATETIME"),
    ]

    for col_name, col_type in new_assessment_cols:
        if col_name not in existing_cols:
            print(f"Adding column '{col_name}' to 'assessments'...")
            cursor.execute(f"ALTER TABLE assessments ADD COLUMN {col_name} {col_type}")

    # Columns for `assessment_questions`
    cursor.execute("PRAGMA table_info(assessment_questions)")
    existing_q_cols = {row[1] for row in cursor.fetchall()}
    print(f"Existing columns in assessment_questions: {existing_q_cols}")

    new_q_cols = [
        ("correct_answer", "TEXT"),
        ("course_id", "VARCHAR(36)"),
        ("syllabus_id", "VARCHAR(36)"),
        ("syllabus_version", "INTEGER"),
        ("module_id", "VARCHAR(36)"),
        ("topic_id", "VARCHAR(36)"),
        ("objective_id", "VARCHAR(36)"),
        ("skill_ids", "JSON DEFAULT '[]'"),
        ("question_type", "VARCHAR(50) DEFAULT 'MCQ'"),
        ("difficulty", "VARCHAR(50) DEFAULT 'INTERMEDIATE'"),
        ("marks", "FLOAT DEFAULT 2.0"),
        ("test_cases", "JSON"),
        ("rubric", "JSON"),
        ("code_template", "TEXT"),
        ("code_language", "VARCHAR(50)"),
        ("source", "VARCHAR(100) DEFAULT 'CURATED'"),
        ("source_url", "VARCHAR(500)"),
        ("verification_status", "VARCHAR(50) DEFAULT 'VERIFIED'"),
        ("generation_method", "VARCHAR(50) DEFAULT 'MANUAL'"),
        ("created_at", "DATETIME"),
        ("updated_at", "DATETIME"),
    ]

    for col_name, col_type in new_q_cols:
        if col_name not in existing_q_cols:
            print(f"Adding column '{col_name}' to 'assessment_questions'...")
            cursor.execute(f"ALTER TABLE assessment_questions ADD COLUMN {col_name} {col_type}")

    # Check `assessment_responses` for new columns
    cursor.execute("PRAGMA table_info(assessment_responses)")
    existing_resp_cols = {row[1] for row in cursor.fetchall()}
    new_resp_cols = [
        ("submitted_answer", "TEXT"),
        ("score", "FLOAT DEFAULT 0.0"),
    ]
    for col_name, col_type in new_resp_cols:
        if col_name not in existing_resp_cols:
            print(f"Adding column '{col_name}' to 'assessment_responses'...")
            cursor.execute(f"ALTER TABLE assessment_responses ADD COLUMN {col_name} {col_type}")

    conn.commit()
    conn.close()
    print("Migration completed successfully!")

if __name__ == "__main__":
    run_migration()
