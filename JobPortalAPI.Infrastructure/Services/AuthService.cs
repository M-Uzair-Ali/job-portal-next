using JobPortalAPI.Application.DTOs.Auth;
using JobPortalAPI.Application.Interfaces;
using JobPortalAPI.Domain.Entities;
using JobPortalAPI.Domain.Enums;
using JobPortalAPI.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using BCrypt.Net;

namespace JobPortalAPI.Infrastructure.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _context;
    private readonly TokenService _tokenService;
    private readonly IConfiguration _configuration;

    public AuthService(AppDbContext context, TokenService tokenService, IConfiguration configuration)
    {
        _context = context;
        _tokenService = tokenService;
        _configuration = configuration;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterRequestDto request)
    {
        // Check if email already exists
        var existingUser = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (existingUser != null)
            throw new Exception("Email already registered.");

        // Parse role
        if (!Enum.TryParse<UserRole>(request.Role, true, out var userRole)
            || userRole == UserRole.Admin)
        {
            throw new Exception("Invalid role. Use Recruiter or Candidate.");
        }

        // Create user with hashed password
        var user = new User
        {
            Id = Guid.NewGuid(),
            FullName = request.FullName,
            Email = request.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = userRole,
            CreatedAt = DateTime.UtcNow
        };

        _context.Users.Add(user);

        // Generate tokens
        var jwtToken = _tokenService.GenerateJwtToken(user);
        var refreshToken = CreateRefreshToken(user.Id);

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = jwtToken,
            RefreshToken = refreshToken.Token,
            FullName = user.FullName,
            Role = user.Role.ToString()
        };
    }

    public async Task<AuthResponseDto> LoginAsync(LoginRequestDto request)
    {
        // Find user by email
        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null)
            throw new Exception("Invalid email or password.");

        // Verify password
        if (!BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new Exception("Invalid email or password.");

        // Generate tokens
        var jwtToken = _tokenService.GenerateJwtToken(user);
        var refreshToken = CreateRefreshToken(user.Id);

        _context.RefreshTokens.Add(refreshToken);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = jwtToken,
            RefreshToken = refreshToken.Token,
            FullName = user.FullName,
            Role = user.Role.ToString()
        };
    }

    public async Task<AuthResponseDto> RefreshTokenAsync(string refreshToken)
    {
        var storedToken = await _context.RefreshTokens
            .Include(r => r.User)
            .FirstOrDefaultAsync(r => r.Token == refreshToken);

        if (storedToken == null || storedToken.IsRevoked || storedToken.ExpiryDate < DateTime.UtcNow)
            throw new Exception("Invalid or expired refresh token.");

        // Revoke old refresh token
        storedToken.IsRevoked = true;

        // Generate new tokens
        var newJwtToken = _tokenService.GenerateJwtToken(storedToken.User);
        var newRefreshToken = CreateRefreshToken(storedToken.UserId);

        _context.RefreshTokens.Add(newRefreshToken);
        await _context.SaveChangesAsync();

        return new AuthResponseDto
        {
            Token = newJwtToken,
            RefreshToken = newRefreshToken.Token,
            FullName = storedToken.User.FullName,
            Role = storedToken.User.Role.ToString()
        };
    }

    // Private helper
    private RefreshToken CreateRefreshToken(Guid userId)
    {
        var expiryDays = int.Parse(
            _configuration["JwtSettings:RefreshTokenExpiryDays"]!);

        return new RefreshToken
        {
            Id = Guid.NewGuid(),
            Token = _tokenService.GenerateRefreshToken(),
            UserId = userId,
            ExpiryDate = DateTime.UtcNow.AddDays(expiryDays),
            IsRevoked = false,
            CreatedAt = DateTime.UtcNow
        };
    }
}