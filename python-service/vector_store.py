from qdrant_client import QdrantClient
from qdrant_client.models import VectorParams, Distance, PointStruct
from sentence_transformers import SentenceTransformer

model = SentenceTransformer('all-MiniLM-L6-v2')
client = QdrantClient(":memory:")  # runs in memory, no Docker needed yet

# create a collection for jobs
client.create_collection(
    collection_name="jobs",
    vectors_config=VectorParams(size=384, distance=Distance.COSINE)
)

# fake job listings
jobs = [
    {"id": 1, "title": "ASP.NET Core Backend Developer", "description": "Looking for a .NET developer with REST API and SQL Server experience."},
    {"id": 2, "title": "React Frontend Developer", "description": "Seeking a React developer with Redux and JavaScript skills."},
    {"id": 3, "title": "Python AI Engineer", "description": "Need a Python developer with machine learning and NLP experience."},
    {"id": 4, "title": "Graphic Designer", "description": "Creative designer needed with Photoshop and Illustrator skills."},
]

# embed and store each job
for job in jobs:
    vector = model.encode(job["description"]).tolist()
    client.upsert(
        collection_name="jobs",
        points=[PointStruct(id=job["id"], vector=vector, payload={"title": job["title"]})]
    )

# search with a resume
resume = "Backend developer with ASP.NET Core, JWT authentication, Entity Framework, and SQL Server experience."
resume_vector = model.encode(resume).tolist()

results = client.query_points(
    collection_name="jobs",
    query=resume_vector,
    limit=3
)

for r in results.points:
    print(f"  {r.payload['title']} — Match Score: {r.score:.2f}")