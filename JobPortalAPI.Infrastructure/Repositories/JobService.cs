using JobPortalAPI.Application.Common;
using JobPortalAPI.Application.DTOs.Job;
using JobPortalAPI.Application.Interfaces;
using JobPortalAPI.Domain.Entities;
using System.Text.Json;

namespace JobPortalAPI.Infrastructure.Services;

public class JobService : IJobService
{
    private readonly IJobRepository _jobRepository;
    private readonly IMatchingService _matchingService;

    public JobService(IJobRepository jobRepository, IMatchingService matchingService)
    {
        _jobRepository = jobRepository;
        _matchingService = matchingService;
    }

    public async Task<JobResponseDto> CreateJobAsync(CreateJobDto dto, Guid recruiterId)
    {
        var job = new Job
        {
            Id = Guid.NewGuid(),
            Title = dto.Title,
            Description = dto.Description,
            Salary = dto.Salary,
            Location = dto.Location,
            JobType = dto.JobType,
            ExpiryDate = dto.ExpiryDate,
            RecruiterId = recruiterId,
            CreatedAt = DateTime.UtcNow
        };

        try
        {
            var keyPoints = await _matchingService.GenerateKeyPointsAsync(job.Description);
            job.KeyPoints = JsonSerializer.Serialize(keyPoints);
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Warning: Could not generate key points: {ex.Message}");
        }

        var created = await _jobRepository.CreateAsync(job);

        // auto-index in Qdrant after creating
        try
        {
            await _matchingService.IndexJobAsync(
                job.Id.GetHashCode(),
                job.Title,
                job.Description
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Warning: Could not index job in Qdrant: {ex.Message}");
        }

        return MapToDto(created);
    }

    public async Task<PagedResult<JobResponseDto>> GetJobsAsync(
        int page,
        int pageSize,
        string? location,
        string? jobType,
        decimal? minSalary,
        decimal? maxSalary)
    {
        var (jobs, totalCount) = await _jobRepository.GetAllAsync(
            page, pageSize, location, jobType, minSalary, maxSalary);

        return new PagedResult<JobResponseDto>
        {
            Items = jobs.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<JobResponseDto> GetJobByIdAsync(Guid id)
    {
        var job = await _jobRepository.GetByIdAsync(id);
        if (job == null)
            throw new KeyNotFoundException("Job not found.");
        return MapToDto(job);
    }

    public async Task<JobResponseDto> UpdateJobAsync(Guid id, CreateJobDto dto, Guid recruiterId)
    {
        var job = await _jobRepository.GetByIdAsync(id);
        if (job == null)
            throw new KeyNotFoundException("Job not found.");
        if (job.RecruiterId != recruiterId)
            throw new UnauthorizedAccessException("You are not authorized to update this job.");

        job.Title = dto.Title;
        job.Description = dto.Description;
        job.Salary = dto.Salary;
        job.Location = dto.Location;
        job.JobType = dto.JobType;
        job.ExpiryDate = dto.ExpiryDate;

        var updated = await _jobRepository.UpdateAsync(job);


        try
        {
            await _matchingService.IndexJobAsync(
                job.Id.GetHashCode(),
                job.Title,
                job.Description
            );
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Warning: Could not re-index job in Qdrant: {ex.Message}");
        }

        return MapToDto(updated);
    }

    public async Task DeleteJobAsync(Guid id, Guid recruiterId)
    {
        var job = await _jobRepository.GetByIdAsync(id);
        if (job == null)
            throw new KeyNotFoundException("Job not found.");
        if (job.RecruiterId != recruiterId)
            throw new UnauthorizedAccessException("You are not authorized to delete this job.");

        await _jobRepository.DeleteAsync(job);

        // auto-delete from Qdrant
        try
        {
            await _matchingService.DeleteJobAsync(job.Id.GetHashCode());
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Warning: Could not delete job from Qdrant: {ex.Message}");
        }
    }

    private static JobResponseDto MapToDto(Job job) => new()
    {
        Id = job.Id,
        Title = job.Title,
        Description = job.Description,
        Salary = job.Salary,
        Location = job.Location,
        JobType = job.JobType,
        CreatedAt = job.CreatedAt,
        ExpiryDate = job.ExpiryDate,
        RecruiterName = job.Recruiter?.FullName ?? "Unknown",
        KeyPoints = string.IsNullOrWhiteSpace(job.KeyPoints)
            ? new List<string>()
            : JsonSerializer.Deserialize<List<string>>(job.KeyPoints) ?? new List<string>()
    };

    public async Task<List<JobResponseDto>> GetMyJobsAsync(Guid recruiterId)
    {
        var jobs = await _jobRepository.GetByRecruiterIdAsync(recruiterId);
        return jobs.Select(MapToDto).ToList();
    }

    public async Task<int> BackfillKeyPointsAsync()
    {
        var jobsMissingKeyPoints = await _jobRepository.GetJobsMissingKeyPointsAsync();
        int updated = 0;

        foreach (var job in jobsMissingKeyPoints)
        {
            try
            {
                var keyPoints = await _matchingService.GenerateKeyPointsAsync(job.Description);
                var json = JsonSerializer.Serialize(keyPoints);
                await _jobRepository.UpdateKeyPointsAsync(job.Id, json);
                updated++;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Warning: Could not backfill key points for job {job.Id}: {ex.Message}");
            }
        }

        return updated;
    }
}