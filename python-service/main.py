from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from matcher import index_jobs, match_resume, client
from pdf_extractor import extract_text_from_pdf
import os

app = FastAPI(title="HunarAI Matching Engine", version="1.0")

# request models
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

# health check
@app.get("/health")
def health():
    return {"status": "HunarAI matching engine is running"}

# match resume text to jobs
@app.post("/match")
def match(request: ResumeRequest):
    if not request.resume_text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")
    matches = match_resume(request.resume_text, top_k=request.top_k)
    return {"matches": matches, "total": len(matches)}

# match CV file to jobs
@app.post("/match-cv")
def match_cv(request: CVFileRequest):
    base_path = r"C:\Users\uzair\source\repos\JobPortalAPI\JobPortalAPI\Uploads"
    full_path = os.path.join(base_path, request.cv_file_path)

    if not os.path.exists(full_path):
        raise HTTPException(status_code=404, detail="CV file not found.")

    resume_text = extract_text_from_pdf(full_path)

    if not resume_text.strip():
        raise HTTPException(status_code=400, detail="Could not extract text from CV.")

    matches = match_resume(resume_text, top_k=request.top_k)
    return {
        "matches": matches,
        "total": len(matches),
        "resume_preview": resume_text[:200]
    }

# index a single job
@app.post("/index-job")
def index_job(job: JobRequest):
    index_jobs([{
        "id": job.job_id,
        "title": job.title,
        "description": job.description
    }])
    return {"message": f"Job '{job.title}' indexed successfully."}

@app.delete("/delete-job/{job_id}")
def delete_job(job_id: int):
    try:
        client.delete(
            collection_name="jobs",
            points_selector=[job_id]
        )
        return {"message": f"Job {job_id} deleted from Qdrant successfully."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))