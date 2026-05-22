# JobPortalAPI

A fully structured RESTful API built with **ASP.NET Core 8** following **Clean Architecture** principles. Designed as the backend foundation for an AI-powered career matching platform targeting the Pakistani job market.

---

## Tech Stack

| Technology | Purpose |
|---|---|
| ASP.NET Core 8 | Web API framework |
| Entity Framework Core 8 | ORM  SQL Server migrations |
| SQL Server | Primary relational database |
| JWT Bearer Auth | Stateless authentication |
| BCrypt.Net-Next | Secure password hashing |
| Refresh Tokens | Persistent sessions with token rotation |
| Swagger / Swashbuckle | Interactive API documentation |
| Clean Architecture | 4-layer separation of concerns |

---

## Architecture

The project follows **Clean Architecture** (Onion Architecture) with four distinct layers:

```
JobPortalAPI/
│
├── JobPortalAPI                  → Presentation Layer
│   └── Controllers               → HTTP routing, Swagger UI
│
├── JobPortalAPI.Application      → Application Layer
│   ├── Interfaces                → Service & repository contracts
│   ├── DTOs                      → Data Transfer Objects
│   └── Common                    → Shared utilities (PagedResult<T>)
│
├── JobPortalAPI.Domain           → Domain Layer
│   ├── Entities                  → User, Job, JobApplication, RefreshToken
│   └── Enums                     → UserRole, ApplicationStatus
│
└── JobPortalAPI.Infrastructure   → Infrastructure Layer
    ├── Persistence               → AppDbContext, EF Core migrations
    ├── Repositories              → JobRepository, ApplicationRepository
    └── Services                  → AuthService, JobService, ApplicationService, TokenService
```

> **Dependency rule:** Domain ← Application ← Infrastructure ← Presentation
> The Domain layer has zero external dependencies.

---

## Features

### Authentication & Security
- User registration with role selection (Admin, Recruiter, Candidate)
- JWT access token generation with configurable expiry
- Refresh token rotation old token revoked, new token issued on every refresh
- BCrypt password hashing plain text passwords never stored
- Role-based endpoint authorization

### Job Management
- Recruiters can create, update, and delete their own job listings
- Public job browsing with filters (location, job type, salary range)
- Paginated results
- Ownership enforcement recruiters can only modify their own jobs
- Admins can delete any listing

### Application System
- Candidates apply to jobs with CV file path
- Duplicate application prevention one candidate, one application per job
- Expired job listing protection
- Recruiters update application status (Pending → Accepted / Rejected)
- Candidates view all their own applications

---

## API Endpoints

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | None | Register a new user |
| POST | `/api/auth/login` | None | Login and receive JWT + refresh token |
| POST | `/api/auth/refresh-token` | None | Rotate refresh token |

### Jobs
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/jobs` | Recruiter | Create a new job listing |
| GET | `/api/jobs` | None | Get paginated jobs with filters |
| GET | `/api/jobs/{id}` | None | Get job details by ID |
| PUT | `/api/jobs/{id}` | Recruiter | Update own job listing |
| DELETE | `/api/jobs/{id}` | Recruiter / Admin | Delete job listing |

### Applications
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/api/applications` | Candidate | Apply for a job |
| GET | `/api/applications/my` | Candidate | View my applications |
| PUT | `/api/applications/{id}/status` | Recruiter | Update application status |

---

## Getting Started

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [SQL Server](https://www.microsoft.com/en-us/sql-server/sql-server-downloads) (or SQL Server Express)
- [Visual Studio 2022](https://visualstudio.microsoft.com/) or [VS Code](https://code.visualstudio.com/)

### 1. Clone the repository
```bash
git clone https://github.com/M-Uzair-Ali/JobPortalAPI.git
cd JobPortalAPI
```

### 2. Configure the database connection
Open `JobPortalAPI/appsettings.json` and update:
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Server=YOUR_SERVER;Database=JobPortalDB;Trusted_Connection=True;TrustServerCertificate=True"
  },
  "JwtSettings": {
    "SecretKey": "your-secret-key-minimum-32-characters",
    "Issuer": "JobPortalAPI",
    "Audience": "JobPortalClient",
    "ExpiryMinutes": 60
  }
}
```

### 3. Apply database migrations
```bash
cd JobPortalAPI
dotnet ef database update
```

### 4. Run the API
```bash
dotnet run
```

### 5. Open Swagger UI
```
https://localhost:7259/swagger
```

---

## Testing the API

### Step 1 Register a Recruiter
```json
POST /api/auth/register
{
  "fullName": "Ahmed Khan",
  "email": "ahmed@example.com",
  "password": "Password123!",
  "role": "Recruiter"
}
```

### Step 2 Login and copy the token
```json
POST /api/auth/login
{
  "email": "ahmed@example.com",
  "password": "Password123!"
}
```

### Step 3 Authorize in Swagger
Click the **Authorize** button in Swagger UI and enter:
```
Bearer eyJhbGciOiJIUzI1NiIs...
```

### Step 4 Create a job listing
```json
POST /api/jobs
{
  "title": "Senior .NET Developer",
  "description": "We are looking for an experienced .NET developer...",
  "salary": 150000,
  "location": "Lahore, Pakistan",
  "jobType": "Full-Time",
  "expiryDate": "2026-12-31"
}
```

### Step 5 Register a Candidate and apply
```json
POST /api/applications
{
  "jobId": "your-job-id-here",
  "cvFilePath": "uploads/cv.pdf"
}
```

---

## Project Structure Key Files

```
JobPortalAPI.Domain/
├── Entities/
│   ├── User.cs               → Id, FullName, Email, PasswordHash, Role
│   ├── Job.cs                → Id, Title, Description, Salary, Location, ExpiryDate
│   ├── JobApplication.cs     → Id, JobId, CandidateId, CVFilePath, Status
│   └── RefreshToken.cs       → Id, Token, ExpiryDate, IsRevoked, UserId
└── Enums/
    ├── UserRole.cs            → Admin = 1, Recruiter = 2, Candidate = 3
    └── ApplicationStatus.cs  → Pending = 1, Accepted = 2, Rejected = 3

JobPortalAPI.Infrastructure/
├── Services/
│   ├── AuthService.cs        → Register, Login, RefreshToken flow
│   ├── JobService.cs         → CRUD, ownership checks, pagination
│   ├── ApplicationService.cs → Apply, GetMyApplications, UpdateStatus
│   └── TokenService.cs       → JWT generation, secure refresh token
└── Repositories/
    ├── JobRepository.cs      → EF Core queries, filtered pagination
    └── ApplicationRepository.cs → Application queries, duplicate check
```

---

## Business Rules Enforced

- A candidate **cannot apply twice** to the same job
- A recruiter **can only edit or delete their own** job listings
- An **expired job** cannot receive new applications
- **Refresh token rotation** each refresh invalidates the previous token
- **Role validation** on registration only Admin, Recruiter, Candidate accepted

---

## Part of AI-Project

This API is the backend foundation of **AI-Porject** an AI-powered career matching platform built for the Pakistani job market.

**Planned AI extensions (coming in AI-Project):**
- Resume parsing with GPT-4o
- Semantic job matching with SBERT + Qdrant vector database
- Skill gap analysis with personalized learning roadmap
- Real-time results streaming with SignalR
- React frontend dashboard

---

## Roadmap

- [x] Clean Architecture setup
- [x] JWT authentication with refresh token rotation
- [x] Role-based authorization
- [x] Job listings with pagination and filters
- [x] Application system with status tracking
- [ ] FluentValidation on all DTOs
- [ ] Global exception handling middleware
- [ ] CV / resume file upload endpoint
- [ ] Unit tests with xUnit (10+ tests)
- [ ] Serilog structured logging
- [ ] Rate limiting on auth endpoints
- [ ] HunarAI AI integration layer

---

## Author

**Muhammad Uzair Ali ** BSCS Third Year Student
- GitHub: [@M-Uzair-Ali](https://github.com/M-Uzair-Ali)
- Project: HunarAI AI-Powered Career Matching for Pakistan

---

## License

This project is licensed under the MIT License.
