namespace JobPortalAPI.Application.DTOs.Job;

public class JobResponseDto
{
    public Guid Id { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public decimal Salary { get; set; }
    public string Location { get; set; } = null!;
    public string JobType { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    public DateTime ExpiryDate { get; set; }
    public string RecruiterName { get; set; } = null!;
    public List<string> KeyPoints { get; set; } = new();
}