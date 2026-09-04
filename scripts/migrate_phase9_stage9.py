import sqlite3
import datetime

def migrate():
    conn = sqlite3.connect('pathfinder.db')
    cursor = conn.cursor()

    columns_to_add = [
        ("country", "VARCHAR(50) DEFAULT 'India'"),
        ("state", "VARCHAR(100) DEFAULT 'All India'"),
        ("city", "VARCHAR(100) DEFAULT 'Pan-India'"),
        ("min_education_stage", "VARCHAR(100) DEFAULT 'Undergraduate'"),
        ("eligible_streams", "JSON DEFAULT '[]'"),
        ("application_url", "VARCHAR(500) DEFAULT 'https://jansahay.gov.in/careers'"),
        ("source", "VARCHAR(100) DEFAULT 'JanSahay Verified Portal'"),
        ("provider", "VARCHAR(100) DEFAULT 'Direct Employer'"),
        ("retrieved_at", "DATETIME"),
        ("expires_at", "DATETIME"),
        ("verification_status", "VARCHAR(50) DEFAULT 'VERIFIED'"),
        ("freshness", "VARCHAR(50) DEFAULT 'FRESH'")
    ]

    cursor.execute("PRAGMA table_info(opportunities);")
    existing_cols = {row[1] for row in cursor.fetchall()}

    for col_name, col_type in columns_to_add:
        if col_name not in existing_cols:
            print(f"Adding column {col_name} to opportunities...")
            cursor.execute(f"ALTER TABLE opportunities ADD COLUMN {col_name} {col_type};")

    conn.commit()
    conn.close()
    print("Migration Phase 9 Stage 9 complete.")

if __name__ == "__main__":
    migrate()
