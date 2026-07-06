namespace JobPortalAPI.Application.DTOs.Application;

public class ApplicationResponseDto
{
    public Guid Id { get; set; }
    public string JobTitle { get; set; } = null!;
    public string CandidateName { get; set; } = null!;
    public string Status { get; set; } = null!;
    public DateTime AppliedAt { get; set; }
    public string CVFilePath { get; set; } = null!;
}

