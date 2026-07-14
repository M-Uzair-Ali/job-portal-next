using JobPortalAPI.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;
using Microsoft.Extensions.Configuration;

namespace JobPortalAPI.Infrastructure.Services
{
    public class MatchingService : IMatchingService
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;

        public MatchingService(HttpClient httpClient, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _baseUrl = configuration["PythonService:BaseUrl"] ?? "http://127.0.0.1:8000";
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
            var payload = new { cv_file_path = cvFilePath, job_description = jobDescription, job_title = jobTitle };
            var json = JsonSerializer.Serialize(payload);
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