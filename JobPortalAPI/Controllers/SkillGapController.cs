using JobPortalAPI.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortalAPI.Controllers
{
    [ApiController]
    [Route("api/skillgap")]
    public class SkillGapController : ControllerBase
    {
        private readonly IMatchingService _matchingService;
        private readonly IJobService _jobService;

        public SkillGapController(
            IMatchingService matchingService,
            IJobService jobService)
        {
            _matchingService = matchingService;
            _jobService = jobService;
        }

        [HttpPost]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> AnalyzeSkillGap([FromBody] SkillGapRequest request)
        {
            try
            {
                // fetch job description from SQL Server automatically
                var job = await _jobService.GetJobByIdAsync(request.JobId);

                // call Python skill gap service
                var result = await _matchingService.AnalyzeSkillGapAsync(
                    request.CVFilePath,
                    job.Description,
                    job.Title
                );

                return Ok(result);
            }
            catch (KeyNotFoundException ex)
            {
                return NotFound(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Skill gap analysis failed: " + ex.Message });
            }
        }
    }

    public class SkillGapRequest
    {
        public Guid JobId { get; set; }
        public string CVFilePath { get; set; } = null!;
    }
}