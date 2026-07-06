using FluentValidation;
using JobPortalAPI.Application.DTOs;
using JobPortalAPI.Application.DTOs.Auth;

namespace JobPortalAPI.Application.Validators
{
    public class RegisterRequestValidator : AbstractValidator<RegisterRequestDto>
    {
        public RegisterRequestValidator()
        {
            RuleFor(x => x.FullName)
                .NotEmpty().WithMessage("Full name is required.")
                .MinimumLength(3).WithMessage("Full name must be at least 3 characters.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Invalid email format.");

            RuleFor(x => x.Password)
                .NotEmpty().WithMessage("Password is required.")
                .MinimumLength(6).WithMessage("Password must be at least 6 characters.");

            RuleFor(x => x.Role)
                .NotEmpty().WithMessage("Role is required.")
                .Must(r => r == "Admin" || r == "Recruiter" || r == "Candidate")
                .WithMessage("Role must be Admin, Recruiter, or Candidate.");
        }
    }
}