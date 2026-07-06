using Microsoft.AspNetCore.Http;

namespace JobPortalAPI.Application.Interfaces
{
    public interface IFileStorageService
    {
        Task<string> UploadFileAsync(IFormFile file, string subFolder = "cvs");
        void DeleteFile(string filePath);
    }
}