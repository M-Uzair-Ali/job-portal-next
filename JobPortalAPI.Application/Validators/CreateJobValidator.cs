using FluentValidation;
using JobPortalAPI.Application.DTOs;
using JobPortalAPI.Application.DTOs.Job;

namespace JobPortalAPI.Application.Validators
{
    public class CreateJobValidator : AbstractValidator<CreateJobDto>
    {
        public CreateJobValidator()
        {
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Job title is required.")
                .MinimumLength(3).WithMessage("Job title must be at least 3 characters.")
                .MaximumLength(100).WithMessage("Job title must not exceed 100 characters.");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Job description is required.")
                .MinimumLength(20).WithMessage("Job description must be at least 20 characters.");

            RuleFor(x => x.Location)
                .NotEmpty().WithMessage("Location is required.");

            RuleFor(x => x.Salary)
                .GreaterThan(0).WithMessage("Salary must be greater than 0.");
        }
    }
}