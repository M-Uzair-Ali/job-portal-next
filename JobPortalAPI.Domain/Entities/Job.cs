namespace JobPortalAPI.Domain.Entities;

public class Job
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Salary { get; set; }
    public string Location { get; set; } = null!;
    public string JobType { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiryDate { get; set; }

    public string? KeyPoints { get; set; }
    public Guid RecruiterId { get; set; }
    public User Recruiter { get; set; } = null!;

    public ICollection<JobApplication> JobApplications { get; set; } = new List<JobApplication>();
}