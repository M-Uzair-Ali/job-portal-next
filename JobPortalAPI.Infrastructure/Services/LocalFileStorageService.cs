using JobPortalAPI.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Configuration;


namespace JobPortalAPI.Infrastructure.Services
{
    public class LocalFileStorageService : IFileStorageService
    {
        private readonly string _baseUploadPath;

        public LocalFileStorageService(IConfiguration configuration)
        {
            _baseUploadPath = configuration["FileStorage:BasePath"]
                ?? Path.Combine(Directory.GetCurrentDirectory(), "Uploads");
        }

        public async Task<string> UploadFileAsync(IFormFile file, string subFolder = "cvs")
        {
            // validate file is PDF
            if (file == null || file.Length == 0)
                throw new ArgumentException("File is empty or null.");

            if (!file.ContentType.Equals("application/pdf", StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Only PDF files are allowed.");

            // max file size 5MB
            if (file.Length > 5 * 1024 * 1024)
                throw new ArgumentException("File size must not exceed 5MB.");

            // create folder if it doesn't exist
            var uploadFolder = Path.Combine(_baseUploadPath, subFolder);
            Directory.CreateDirectory(uploadFolder);

            // generate unique filename to avoid conflicts
            var uniqueFileName = $"{Guid.NewGuid()}_{file.FileName}";
            var filePath = Path.Combine(uploadFolder, uniqueFileName);

            // save file to disk
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // return relative path to store in database
            return Path.Combine(subFolder, uniqueFileName);
        }

        public void DeleteFile(string filePath)
        {
            if (string.IsNullOrEmpty(filePath)) return;

            var fullPath = Path.Combine(_baseUploadPath, filePath);
            if (File.Exists(fullPath))
                File.Delete(fullPath);
        }
    }
}