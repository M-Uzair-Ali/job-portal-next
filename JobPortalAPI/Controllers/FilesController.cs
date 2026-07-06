using JobPortalAPI.Application.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace JobPortalAPI.Controllers
{
    [ApiController]
    [Route("api/files")]
    public class FilesController : ControllerBase
    {
        private readonly IFileStorageService _fileStorageService;

        public FilesController(IFileStorageService fileStorageService)
        {
            _fileStorageService = fileStorageService;
        }

        [HttpPost("upload")]
        [Authorize(Roles = "Candidate")]
        public async Task<IActionResult> UploadCV(IFormFile file)
        {
            try
            {
                var filePath = await _fileStorageService.UploadFileAsync(file);
                return Ok(new
                {
                    Message = "CV uploaded successfully.",
                    FilePath = filePath
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred while uploading the file." });
            }
        }

        [HttpDelete("delete")]
        [Authorize(Roles = "Candidate")]
        public IActionResult DeleteCV([FromQuery] string filePath)
        {
            try
            {
                _fileStorageService.DeleteFile(filePath);
                return Ok(new { Message = "CV deleted successfully." });
            }
            catch (Exception)
            {
                return StatusCode(500, new { Message = "An error occurred while deleting the file." });
            }
        }
    }
}