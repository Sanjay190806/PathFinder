import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "pathfinder.db")
print(f"Connecting to {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(learner_profiles)")
existing_cols = set([row[1] for row in cursor.fetchall()])

new_cols = [
    ("country", "TEXT DEFAULT 'India'"),
    ("education_stage", "TEXT"),
    ("education_domain", "TEXT"),
    ("education_stream", "TEXT"),
    ("specialization", "TEXT"),
    ("qualification", "TEXT"),
    ("current_role", "TEXT"),
    ("work_domain", "TEXT"),
    ("institution", "TEXT"),
    ("graduation_year", "TEXT"),
    ("custom_education_label", "TEXT"),
    ("education_profile", "JSON")
]

for col_name, col_type in new_cols:
    if col_name not in existing_cols:
        cursor.execute(f"ALTER TABLE learner_profiles ADD COLUMN {col_name} {col_type}")
        print(f"Added column {col_name}")
    else:
        print(f"Column {col_name} already exists")

conn.commit()
cursor.execute("PRAGMA table_info(learner_profiles)")
print("Updated columns:", [row[1] for row in cursor.fetchall()])
conn.close()
