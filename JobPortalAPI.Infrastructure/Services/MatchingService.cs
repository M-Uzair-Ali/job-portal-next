using JobPortalAPI.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;
using System.Linq;
using Microsoft.Extensions.Logging;

namespace JobPortalAPI.Infrastructure.Services
{
    public class MatchingService : IMatchingService
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;
        private readonly ILogger<MatchingService> _logger;

        public MatchingService(HttpClient httpClient, IConfiguration configuration, ILogger<MatchingService> logger)
        {
            _httpClient = httpClient;
            _baseUrl = configuration["PythonService:BaseUrl"] ?? "http://127.0.0.1:8000";
            _logger = logger;
        }

        public async Task<string> MatchResumeAsync(string resumeText, int topK = 5)
        {
            var payload = new { resume_text = resumeText, top_k = topK };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_baseUrl}/match", content);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }

        public async Task<string> AnalyzeSkillGapAsync(string cvFilePath, string jobDescription, string jobTitle)
        {
            _logger.LogInformation($"AnalyzeSkillGapAsync called with: cvFilePath='{cvFilePath}', jobTitle='{jobTitle}', jobDescription length={jobDescription?.Length ?? 0}");

            var payload = new { cv_file_path = cvFilePath, job_description = jobDescription, job_title = jobTitle };
            var json = JsonSerializer.Serialize(payload);

            _logger.LogInformation($"Sending to Python: {json}");

            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_baseUrl}/skill-gap", content);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }
        public async Task IndexJobAsync(int jobId, string title, string description)
        {
            var payload = new { job_id = jobId, title, description };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_baseUrl}/index-job", content);
            response.EnsureSuccessStatusCode();
        }
        public async Task<List<string>> GenerateKeyPointsAsync(string jobDescription)
        {
            var payload = new { job_description = jobDescription, num_points = 5 };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_baseUrl}/summarize-job", content);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync();
            using var doc = JsonDocument.Parse(responseJson);

            return doc.RootElement.GetProperty("key_points")
                .EnumerateArray()
                .Select(x => x.GetString() ?? "")
                .ToList();
        }
        public async Task<string> MatchCVAsync(string cvFilePath, int topK = 5)
        {
            var payload = new { cv_file_path = cvFilePath, top_k = topK };
            var json = JsonSerializer.Serialize(payload);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"{_baseUrl}/match-cv", content);
            response.EnsureSuccessStatusCode();

            return await response.Content.ReadAsStringAsync();
        }

        public async Task DeleteJobAsync(int jobId)
        {
            var response = await _httpClient.DeleteAsync($"{_baseUrl}/delete-job/{jobId}");
            response.EnsureSuccessStatusCode();
        }
    }
}