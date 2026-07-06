namespace JobPortalAPI.Application.Interfaces
{
    public interface IMatchingService
    {
        Task<string> MatchResumeAsync(string resumeText, int topK = 5);
        Task<string> MatchCVAsync(string cvFilePath, int topK = 5);
        Task IndexJobAsync(int jobId, string title, string description);
        Task DeleteJobAsync(int jobId);
    }
}