import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "pathfinder.db")
print(f"Connecting to database: {db_path}")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(learner_profiles)")
existing_cols = set([row[1] for row in cursor.fetchall()])

new_cols = [
    ("board", "TEXT"),
    ("subject_combination", "TEXT"),
    ("institution_type", "TEXT"),
    ("current_year", "TEXT"),
    ("subjects", "JSON")
]

for col_name, col_type in new_cols:
    if col_name not in existing_cols:
        cursor.execute(f"ALTER TABLE learner_profiles ADD COLUMN {col_name} {col_type}")
        print(f"Added column: {col_name}")
    else:
        print(f"Column already exists: {col_name}")

conn.commit()
cursor.execute("PRAGMA table_info(learner_profiles)")
print("Updated columns count:", len(cursor.fetchall()))
conn.close()
