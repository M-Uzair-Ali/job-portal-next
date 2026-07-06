from sentence_transformers import SentenceTransformer, util

# load the model (downloads automatically first time, ~90MB)
model = SentenceTransformer('all-MiniLM-L6-v2')

resume_text = "Experienced backend developer skilled in ASP.NET Core, REST APIs, and SQL Server."
job_text = "Looking for a .NET developer with experience building REST APIs and working with SQL databases."
unrelated_text = "We need a graphic designer with Photoshop and illustration skills."

# generate embeddings
resume_vector = model.encode(resume_text)
job_vector = model.encode(job_text)
unrelated_vector = model.encode(unrelated_text)

# compare similarity
score1 = util.cos_sim(resume_vector, job_vector)
score2 = util.cos_sim(resume_vector, unrelated_vector)

print(f"Resume vs Related Job:   {score1.item():.2f}")
print(f"Resume vs Unrelated Job: {score2.item():.2f}")