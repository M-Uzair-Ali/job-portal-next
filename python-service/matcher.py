from sentence_transformers import SentenceTransformer
from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from sklearn.metrics.pairwise import cosine_similarity
from skill_extractor import extract_skills
from skill_normalizer import normalize_skills

# Setup SBERT model for semantic similarity
model = SentenceTransformer('all-MiniLM-L6-v2')

# Initialize a local Qdrant vector store
client = QdrantClient(':memory:')
collection_name = 'jobs'

try:
    client.create_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=384, distance=Distance.COSINE)
    )
except Exception:
    pass


def get_skill_similarity(skill1, skill2, threshold=0.7):
    """
    Calculate similarity between two skills using SBERT.
    Returns True if similarity > threshold.
    """
    try:
        vec1 = model.encode(skill1)
        vec2 = model.encode(skill2)
        similarity = cosine_similarity([vec1], [vec2])[0][0]
        return similarity > threshold
    except Exception:
        return skill1.strip().lower() == skill2.strip().lower()


def index_jobs(jobs):
    """Index a list of jobs into the Qdrant collection."""
    if not isinstance(jobs, list):
        raise TypeError('jobs must be a list of dictionaries')

    points = []
    for job in jobs:
        job_id = job.get('id')
        title = job.get('title', '')
        description = job.get('description', '')
        text = f"{title}\n{description}".strip()

        if job_id is None:
            raise ValueError('each job must include an id')

        vector = model.encode(text).tolist()
        points.append(PointStruct(id=job_id, vector=vector, payload={
            'title': title,
            'description': description
        }))

    client.upsert(collection_name=collection_name, points=points)
    return {'indexed': len(points)}


def match_resume(resume_text, top_k=5):
    """Match a resume to indexed jobs."""
    if not isinstance(resume_text, str) or not resume_text.strip():
        return []

    vector = model.encode(resume_text).tolist()
    results = client.query_points(collection_name=collection_name, query=vector, limit=top_k)

    matches = []
    for point in getattr(results, 'points', []):
        matches.append({
            'id': getattr(point, 'id', None),
            'title': point.payload.get('title') if point.payload else None,
            'description': point.payload.get('description') if point.payload else None,
            'score': getattr(point, 'score', None)
        })

    return matches


def analyze_skill_gap(resume_text, job_description, job_title):
    """
    Analyze skill gap between resume and job requirements.
    
    Args:
        resume_text: Text extracted from resume PDF
        job_description: Job description text from database
        job_title: Job title for logging
    
    Returns:
        {
            "matchPercentage": 72,
            "matchedSkills": ["python", "sql"],
            "missingSkills": ["kubernetes", "docker"],
            "totalSkills": 8,
            "analysis": "..."
        }
    """
    
    try:
        # Extract skills from resume
        resume_skills_raw = extract_skills(resume_text)
        resume_skills = normalize_skills(resume_skills_raw)
        
        # Extract skills from job description
        job_skills_raw = extract_skills(job_description)
        job_skills = normalize_skills(job_skills_raw)
        
        print(f"\n{'='*60}")
        print(f"Job: {job_title}")
        print(f"{'='*60}")
        print(f"Resume Skills ({len(resume_skills)}): {resume_skills}")
        print(f"Job Skills ({len(job_skills)}): {job_skills}")
        
        # If no skills extracted, return default
        if not job_skills:
            print("⚠ No skills extracted from job description")
            job_skills = ["communication", "teamwork", "problem-solving"]
        
        if not resume_skills:
            print("⚠ No skills extracted from resume")
            return {
                "matchPercentage": 0,
                "matchedSkills": [],
                "missingSkills": job_skills[:10],
                "totalSkills": len(job_skills),
                "analysis": "No skills found in resume"
            }
        
        # Match skills
        matched_skills = []
        missing_skills = []
        
        # Check which job skills are in resume
        for job_skill in job_skills:
            skill_matched = False
            
            # Exact match first
            for resume_skill in resume_skills:
                if job_skill.lower() == resume_skill.lower():
                    matched_skills.append(job_skill)
                    skill_matched = True
                    break
            
            # Semantic similarity match if no exact match
            if not skill_matched:
                for resume_skill in resume_skills:
                    try:
                        if get_skill_similarity(job_skill, resume_skill, threshold=0.65):
                            matched_skills.append(job_skill)
                            skill_matched = True
                            break
                    except:
                        pass
            
            # Not matched
            if not skill_matched:
                missing_skills.append(job_skill)
        
        # Calculate match percentage
        match_percentage = round((len(matched_skills) / len(job_skills) * 100)) if job_skills else 0
        
        # Remove duplicates
        matched_skills = list(set(matched_skills))
        missing_skills = list(set(missing_skills))
        
        print(f"\nMatched Skills ({len(matched_skills)}): {matched_skills}")
        print(f"Missing Skills ({len(missing_skills)}): {missing_skills}")
        print(f"Match Percentage: {match_percentage}%")
        print(f"{'='*60}\n")
        
        # Generate analysis
        if match_percentage >= 80:
            analysis = "Strong match! You have most of the required skills."
        elif match_percentage >= 60:
            analysis = "Good match! Consider developing the missing skills."
        elif match_percentage >= 40:
            analysis = "Moderate match. You may need to learn several skills."
        else:
            analysis = "Limited match. Significant skill development needed."
        
        return {
            "matchPercentage": match_percentage,
            "matchedSkills": matched_skills,
            "missingSkills": missing_skills,
            "totalSkills": len(job_skills),
            "matchedCount": len(matched_skills),
            "analysis": analysis
        }
        
    except Exception as e:
        print(f"Error in analyze_skill_gap: {str(e)}")
        return {
            "matchPercentage": 0,
            "matchedSkills": [],
            "missingSkills": [],
            "totalSkills": 0,
            "analysis": f"Error: {str(e)}"
        }

if __name__ == "__main__":
    # Test with sample data
    sample_resume = """
    Python Developer with 3 years experience.
    Skills: Python, SQL, REST API, FastAPI, React, JavaScript, HTML, CSS, Docker, Git, Linux
    """
    
    sample_job = """
    Python Backend Developer needed.
    Required: Python, SQL, FastAPI, REST API, Docker, Kubernetes, Redis, PostgreSQL, Git, AWS
    """
    
    result = analyze_skill_gap(sample_resume, sample_job, "Python Backend Developer")
    print("\nResult:")
    print(result)