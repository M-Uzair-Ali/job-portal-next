import pandas as pd
import pyodbc
from datetime import datetime, timedelta
import uuid
import os
import random

# ===== CONFIGURE THESE =====
CSV_PATH = "D:/job-scraper/brightspyre_jobs_enriched.csv"
DATABASE_NAME = "JobPortalDB"
# ==========================

# Database connection - Windows Authentication
SERVER = r'(local)\SQLEXPRESS'
connection_string = f'DRIVER={{ODBC Driver 17 for SQL Server}};SERVER={SERVER};Database={DATABASE_NAME};Trusted_Connection=yes;'

def parse_skills(skills_text):
    """Parse skills string into list"""
    if pd.isna(skills_text) or skills_text == '':
        return []
    return [skill.strip() for skill in str(skills_text).split(';')]

def get_random_recruiter(conn):
    """Get a random recruiter from database"""
    cursor = conn.cursor()
    cursor.execute("SELECT Id FROM Users WHERE Email LIKE '%@%' AND Role = 1 ORDER BY CreatedAt DESC")
    results = cursor.fetchall()
    if results:
        return str(results[0][0])
    return None

def import_jobs_from_csv(csv_path, recruiter_id=None):
    """Import jobs from CSV to database"""
    
    if not os.path.exists(csv_path):
        return {"error": f"CSV file not found: {csv_path}", "imported": 0}
    
    try:
        df = pd.read_csv(csv_path)
        print(f"✓ Loaded {len(df)} jobs from CSV")
        
        imported_count = 0
        skipped_count = 0
        error_count = 0
        
        # Connect to database
        conn = pyodbc.connect(connection_string)
        cursor = conn.cursor()
        
        # Get list of all recruiters for random distribution
        cursor.execute("SELECT Id FROM Users WHERE Email LIKE '%@%' AND Role = 1")
        recruiter_results = cursor.fetchall()
        recruiter_ids = [str(r[0]) for r in recruiter_results]
        
        if not recruiter_ids:
            print("✗ No recruiters found in database!")
            return {"error": "No recruiters found", "imported": 0}
        
        print(f"✓ Found {len(recruiter_ids)} recruiters for distribution\n")
        
        for idx, row in df.iterrows():
            try:
                if pd.isna(row['title']) or row['title'] == '':
                    skipped_count += 1
                    continue
                
                job_id = str(uuid.uuid4())
                title = str(row['title']).strip()
                description = str(row['description']).strip() if pd.notna(row['description']) else ""
                location = str(row['location']).strip() if pd.notna(row['location']) else "Remote"
                job_type = str(row['job_type']).strip() if pd.notna(row['job_type']) else "Full-time"
                
                # Parse salary
                try:
                    salary = float(row['salary']) if pd.notna(row['salary']) else 50000.0
                except:
                    salary = 50000.0
                
                # Parse dates
                try:
                    posted_date = pd.to_datetime(row['posted_date']).date() if pd.notna(row['posted_date']) else datetime.now().date()
                except:
                    posted_date = datetime.now().date()
                
                try:
                    expiry_date = pd.to_datetime(row['deadline']).date() if pd.notna(row['deadline']) else None
                except:
                    expiry_date = None
                
                if expiry_date is None:
                    expiry_date = datetime.now().date() + timedelta(days=30)
                
                # Randomly select a recruiter
                random_recruiter_id = random.choice(recruiter_ids)
                
                # Insert into database
                query = """
                INSERT INTO Jobs (Id, Title, Description, Salary, Location, JobType, ExpiryDate, CreatedAt, RecruiterId)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                """
                
                cursor.execute(query, (
                    job_id,
                    title,
                    description,
                    salary,
                    location,
                    job_type,
                    expiry_date,
                    datetime.now(),
                    random_recruiter_id
                ))
                
                imported_count += 1
                
                if (idx + 1) % 50 == 0:
                    print(f"  Imported {idx + 1} jobs...")
                
            except Exception as e:
                print(f"  ✗ Row {idx + 1} error: {str(e)}")
                error_count += 1
                continue
        
        conn.commit()
        conn.close()
        
        return {
            "success": True,
            "imported": imported_count,
            "skipped": skipped_count,
            "errors": error_count,
            "total_processed": len(df)
        }
        
    except Exception as e:
        return {"error": str(e), "imported": 0}

if __name__ == "__main__":
    print("=" * 60)
    print("JOB IMPORTER - Starting...")
    print("=" * 60)
    
    result = import_jobs_from_csv(CSV_PATH)
    
    print("\n" + "=" * 60)
    print("IMPORT RESULTS:")
    print("=" * 60)
    if "success" in result:
        print(f"✓ Imported: {result.get('imported', 0)} jobs")
        print(f"⊘ Skipped: {result.get('skipped', 0)} jobs")
        print(f"✗ Errors: {result.get('errors', 0)} jobs")
    else:
        print(f"✗ Error: {result.get('error', 'Unknown error')}")
    print("=" * 60)