using JobPortalAPI.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace JobPortalAPI.Controllers
{
    [ApiController]
    [Route("api/match")]
    public class MatchController : ControllerBase
    {
        private readonly IMatchingService _matchingService;
        private readonly IFileStorageService _fileStorageService;

        public MatchController(
            IMatchingService matchingService,
            IFileStorageService fileStorageService)
        {
            _matchingService = matchingService;
            _fileStorageService = fileStorageService;
        }

        [HttpPost("resume")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> MatchResume([FromBody] MatchResumeRequest request)
        {
            try
            {
                var result = await _matchingService.MatchResumeAsync(request.ResumeText, request.TopK);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Matching service error: " + ex.Message });
            }
        }
        [HttpPost("cv")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> MatchCV([FromBody] MatchCVRequest request)
        {
            try
            {
                var result = await _matchingService.MatchCVAsync(request.CVFilePath, request.TopK);
                return Ok(result);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Matching service error: " + ex.Message });
            }
        }
    }

    public class MatchResumeRequest
    {
        public string ResumeText { get; set; } = null!;
        public int TopK { get; set; } = 5;
    }
    public class MatchCVRequest
    {
        public string CVFilePath { get; set; } = null!;
        public int TopK { get; set; } = 5;
    }
}