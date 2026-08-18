from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from matcher import analyze_skill_gap, index_jobs, match_resume, model, client
from pdf_extractor import extract_text_from_pdf
from sentence_transformers import util
import os
from skill_normalizer import normalize_skills
from skill_extractor import extract_skills
from candidate_profile import build_candidate_profile
from job_summarizer import extract_key_points
from course_recommender import get_course_suggestions
from dotenv import load_dotenv
load_dotenv()

app = FastAPI(
    title="HunarAI Matching Engine",
    version="2.0"
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
UPLOADS_DIR = os.environ.get(
    "UPLOADS_DIR",
    os.path.normpath(os.path.join(BASE_DIR, "..", "JobPortalAPI", "JobPortalAPI", "Uploads"))
)

class ResumeRequest(BaseModel):
    resume_text: str
    top_k: int = 5


class CVFileRequest(BaseModel):
    cv_file_path: str
    top_k: int = 5


class JobRequest(BaseModel):
    job_id: int
    title: str
    description: str


class SkillGapRequest(BaseModel):
    cv_file_path: str
    job_description: str
    job_title: str

class SummarizeJobRequest(BaseModel):
    job_description: str
    num_points: int = 5


@app.get("/health")
def health():
    return {
        "status": "HunarAI Matching Engine Running"
    }


@app.post("/match")
def match(request: ResumeRequest):

    if not request.resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Resume text cannot be empty."
        )

    matches = match_resume(
        request.resume_text,
        top_k=request.top_k
    )

    return {
        "matches": matches,
        "total": len(matches)
    }

@app.post("/match-cv")
def match_cv(request: CVFileRequest):

    full_path = os.path.join(
        UPLOADS_DIR,
        request.cv_file_path
    )

    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=404,
            detail="CV file not found."
        )

    resume_text = extract_text_from_pdf(full_path)

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from CV."
        )

    matches = match_resume(
        resume_text,
        top_k=request.top_k
    )

    return {
        "matches": matches,
        "total": len(matches),
        "resume_preview": resume_text[:250]
    }


@app.post("/skill-gap")
def skill_gap(request: SkillGapRequest):

    
    BASE_DIR = os.path.dirname(os.path.abspath(__file__))
    base_path = os.environ.get(
        "UPLOADS_DIR",
        os.path.normpath(os.path.join(BASE_DIR, "..", "JobPortalAPI", "JobPortalAPI", "Uploads"))
    )

    full_path = os.path.join(
        base_path,
        request.cv_file_path
    )

    if not os.path.exists(full_path):
        raise HTTPException(
            status_code=404,
            detail="CV file not found."
        )

    resume_text = extract_text_from_pdf(full_path)

    if not resume_text.strip():
        raise HTTPException(
            status_code=400,
            detail="Could not extract text from CV."
        )

    # Clean and validate job description
    job_desc = request.job_description
    if not job_desc or not isinstance(job_desc, str):
        raise HTTPException(
            status_code=400,
            detail="Job description is required and must be a string."
        )

    job_desc = job_desc.strip()

    print("=" * 60)
    print(f"Job Description Length: {len(job_desc)}")
    print(f"Job Description (first 200 chars): {job_desc[:200]}")
    print("=" * 60)

    resume_skills = set(
        normalize_skills(
            extract_skills(resume_text)
        )
    )

    job_skills = set(
        normalize_skills(
            extract_skills(job_desc)
        )
    )

    resume_vector = model.encode(resume_text)
    job_vector = model.encode(job_desc)

    similarity = util.cos_sim(
        resume_vector,
        job_vector
    ).item()

    matched = sorted(resume_skills & job_skills)
    missing = sorted(job_skills - resume_skills)

    required_score = (
        len(matched) / len(job_skills)
        if job_skills else 1.0
    )

    bonus = min(
        len(resume_skills - job_skills) * 0.02,
        0.15
    )

    skill_score = min(required_score + bonus, 1.0)

    final_score = (
        similarity * 0.4 +
        skill_score * 0.6
    )

    match_percentage = round(final_score * 100, 2)

    candidate_profile = build_candidate_profile(
        resume_text=resume_text,
        match_percentage=match_percentage,
        matched_skills=matched,
        missing_skills=missing
    )

    suggested_resources = get_course_suggestions(missing)

    print("=" * 60)
    print("Resume Skills:", sorted(resume_skills))
    print("Job Skills:", sorted(job_skills))
    print("Matched:", matched)
    print("Missing:", missing)
    print(f"Semantic Score: {similarity * 100:.2f}")
    print(f"Skill Score: {skill_score * 100:.2f}")
    print(f"Final Score: {match_percentage:.2f}")
    print("=" * 60)

    # Feedback
    if match_percentage >= 85:
        feedback = "Excellent match for this position."
    elif match_percentage >= 70:
        feedback = "Good match. A few additional skills would strengthen your profile."
    elif match_percentage >= 50:
        feedback = "Average match. Consider improving the missing skills."
    else:
        feedback = "Low match. Significant skill improvement is recommended."

# Response
    return {
        "job_title": request.job_title,
        "match_percentage": match_percentage,
        "feedback": feedback,
        "matched_skills": matched,
        "missing_skills": missing,
        "candidate_profile": candidate_profile,
        "suggested_resources": suggested_resources,
        "resume_preview": resume_text[:250]
    }

@app.delete("/delete-job/{job_id}")
def delete_job(job_id: int):

    try:
        client.delete(
            collection_name="jobs",
            points_selector=[job_id]
        )

        return {
            "message": f"Job {job_id} deleted successfully."
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )

@app.post("/summarize-job")
def summarize_job(request: SummarizeJobRequest):
    if not request.job_description or not request.job_description.strip():
        raise HTTPException(
            status_code=400,
            detail="Job description is required."
        )

    key_points = extract_key_points(request.job_description, request.num_points)

    return {"key_points": key_points}