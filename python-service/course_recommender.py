SKILL_RESOURCES = {
    "python": {
        "resource_title": "Python for Everybody",
        "provider": "Coursera",
        "url": "https://www.coursera.org/specializations/python",
        "reason": "Comprehensive, beginner-friendly path covering core Python fundamentals."
    },
    "fastapi": {
        "resource_title": "FastAPI Official Tutorial",
        "provider": "FastAPI Docs",
        "url": "https://fastapi.tiangolo.com/tutorial/",
        "reason": "The official documentation is the fastest way to learn FastAPI's core concepts."
    },
    "react": {
        "resource_title": "React Official Docs — Learn React",
        "provider": "react.dev",
        "url": "https://react.dev/learn",
        "reason": "Up-to-date official guide covering hooks, components, and state management."
    },
    "javascript": {
        "resource_title": "JavaScript Algorithms and Data Structures",
        "provider": "freeCodeCamp",
        "url": "https://www.freecodecamp.org/learn/javascript-algorithms-and-data-structures/",
        "reason": "Free, project-based curriculum covering JS fundamentals thoroughly."
    },
    "html": {
        "resource_title": "Responsive Web Design",
        "provider": "freeCodeCamp",
        "url": "https://www.freecodecamp.org/learn/responsive-web-design/",
        "reason": "Covers HTML fundamentals with hands-on projects."
    },
    "css": {
        "resource_title": "Responsive Web Design",
        "provider": "freeCodeCamp",
        "url": "https://www.freecodecamp.org/learn/responsive-web-design/",
        "reason": "Covers CSS layout, flexbox, and grid with practical exercises."
    },
    "sql server": {
        "resource_title": "SQL Server Fundamentals",
        "provider": "Microsoft Learn",
        "url": "https://learn.microsoft.com/en-us/training/paths/sql-server-fundamentals/",
        "reason": "Official Microsoft learning path for SQL Server basics to advanced."
    },
    "sql": {
        "resource_title": "SQL for Data Science",
        "provider": "Coursera",
        "url": "https://www.coursera.org/learn/sql-for-data-science",
        "reason": "Well-reviewed introduction to practical SQL querying."
    },
    "mongodb": {
        "resource_title": "MongoDB Basics",
        "provider": "MongoDB University",
        "url": "https://learn.mongodb.com/",
        "reason": "Free official courses directly from MongoDB's own training platform."
    },
    "docker": {
        "resource_title": "Docker Get Started Guide",
        "provider": "Docker Docs",
        "url": "https://docs.docker.com/get-started/",
        "reason": "Official, hands-on introduction to containerization basics."
    },
    "kubernetes": {
        "resource_title": "Kubernetes Basics",
        "provider": "Kubernetes.io",
        "url": "https://kubernetes.io/docs/tutorials/kubernetes-basics/",
        "reason": "Official interactive tutorial covering core Kubernetes concepts."
    },
    "aws": {
        "resource_title": "AWS Cloud Practitioner Essentials",
        "provider": "AWS Training",
        "url": "https://aws.amazon.com/training/digital/aws-cloud-practitioner-essentials/",
        "reason": "Official free course covering foundational AWS cloud concepts."
    },
    "git": {
        "resource_title": "Git and GitHub for Beginners",
        "provider": "freeCodeCamp",
        "url": "https://www.freecodecamp.org/news/git-and-github-for-beginners/",
        "reason": "Clear, practical introduction to version control workflows."
    },
    "asp.net core": {
        "resource_title": "ASP.NET Core Fundamentals",
        "provider": "Microsoft Learn",
        "url": "https://learn.microsoft.com/en-us/aspnet/core/getting-started/",
        "reason": "Official Microsoft documentation and learning path for ASP.NET Core."
    },
    "entity framework core": {
        "resource_title": "Entity Framework Core Docs",
        "provider": "Microsoft Learn",
        "url": "https://learn.microsoft.com/en-us/ef/core/",
        "reason": "Official EF Core documentation covering setup through advanced querying."
    },
    "jwt": {
        "resource_title": "JWT Introduction",
        "provider": "jwt.io",
        "url": "https://jwt.io/introduction",
        "reason": "Clear explanation of how JWTs work, straight from the spec maintainers."
    },
    "rest api": {
        "resource_title": "REST API Design Best Practices",
        "provider": "freeCodeCamp",
        "url": "https://www.freecodecamp.org/news/rest-api-design-best-practices-build-a-rest-api/",
        "reason": "Practical guide to designing clean, well-structured REST APIs."
    },
    "excel": {
        "resource_title": "Excel Skills for Business",
        "provider": "Coursera",
        "url": "https://www.coursera.org/specializations/excel",
        "reason": "Widely-used specialization covering Excel from basics to advanced analysis."
    },
    "negotiation": {
        "resource_title": "Successful Negotiation: Essential Strategies and Skills",
        "provider": "Coursera",
        "url": "https://www.coursera.org/learn/negotiation-skills",
        "reason": "Highly-rated course covering practical negotiation frameworks."
    },
    "compliance": {
        "resource_title": "Compliance Management Fundamentals",
        "provider": "edX",
        "url": "https://www.edx.org/search?q=compliance",
        "reason": "Explore introductory courses on regulatory and organizational compliance."
    },
    "training": {
        "resource_title": "Training and Development",
        "provider": "LinkedIn Learning",
        "url": "https://www.linkedin.com/learning/topics/training",
        "reason": "Courses on designing and delivering effective training programs."
    },
    "teams": {
        "resource_title": "Teamwork Skills: Communicating Effectively in Groups",
        "provider": "Coursera",
        "url": "https://www.coursera.org/learn/teamwork-skills",
        "reason": "Covers practical collaboration and team-communication techniques."
    },
    "communication": {
        "resource_title": "Improving Communication Skills",
        "provider": "Coursera",
        "url": "https://www.coursera.org/learn/wharton-communication-skills",
        "reason": "Popular course on professional and interpersonal communication."
    },
    "presentation": {
        "resource_title": "Dynamic Public Speaking",
        "provider": "Coursera",
        "url": "https://www.coursera.org/specializations/public-speaking",
        "reason": "Builds presentation and public speaking skills through practice."
    },
    "problem solving": {
        "resource_title": "Effective Problem-Solving and Decision-Making",
        "provider": "Coursera",
        "url": "https://www.coursera.org/learn/problem-solving",
        "reason": "Structured approach to analytical thinking and decision-making."
    },
}


def get_course_suggestions(missing_skills):
    """
    Given a list of missing skills, return one learning resource
    per skill from a curated static map, falling back to a search
    link for anything not explicitly covered.
    """
    if not missing_skills:
        return []

    suggestions = []
    for skill in missing_skills:
        key = skill.strip().lower()
        entry = SKILL_RESOURCES.get(key)

        if entry:
            suggestions.append({
                "skill": skill,
                "resource_title": entry["resource_title"],
                "provider": entry["provider"],
                "url": entry["url"],
                "reason": entry["reason"],
            })
        else:
            suggestions.append({
                "skill": skill,
                "resource_title": f"Learn {skill}",
                "provider": "Search",
                "url": f"https://www.google.com/search?q=learn+{skill.replace(' ', '+')}+course",
                "reason": "No curated resource yet — search results as a starting point.",
            })

    return suggestions