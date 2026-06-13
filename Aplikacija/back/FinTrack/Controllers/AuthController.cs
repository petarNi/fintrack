using FinTrack.Data;
using FinTrack.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace FinTrack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDbContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [AllowAnonymous]
        [HttpPost("signup")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                    return Conflict(new { message = "Email je već registrovan." });

                if (await _context.Users.AnyAsync(u => u.Username == dto.Username))
                    return Conflict(new { message = "Username je zauzet." });

                const string ADMIN_SECRET = "admin123";
                var role = dto.AdminCode == ADMIN_SECRET ? UserRole.Admin : UserRole.User;

                decimal cash = 0m, card = 0m;

                if (role == UserRole.User)
                {
                    if (dto.CashBalance is null || dto.CardBalance is null)
                        return BadRequest(new { message = "Za korisnika su CashBalance i CardBalance obavezni." });

                    if (dto.CashBalance < 0 || dto.CardBalance < 0)
                        return BadRequest(new { message = "Balance mora biti ≥ 0." });

                    cash = dto.CashBalance.Value;
                    card = dto.CardBalance.Value;
                }

                var user = new User
                {
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    Username  = dto.Username,
                    Email     = dto.Email,
                    Password  = dto.Password,
                    Role      = role,
                    CashBalance = cash,
                    CardBalance = card
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                return Ok(new
                {
                    message = "Uspešno ste se registrovali.",
                    role = user.Role.ToString()
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest("Neispravan unos podataka");

            try
            {
                var user = await _context.Users.FirstOrDefaultAsync(u =>
                        (u.Email == dto.UsernameOrEmail || u.Username == dto.UsernameOrEmail) && u.Password == dto.Password);
                if (user == null)
                    return Unauthorized(new { message = "Pogrešan email/username ili lozinka." });

                var token = GenerateJwtToken(user);

                if (user.Role == UserRole.Admin)
                {
                    return Ok(new
                    {
                        message = "Uspešno ste se prijavili.",
                        token,
                        user = new
                        {
                            user.Id,
                            user.Username,
                            FullName = $"{user.FirstName} {user.LastName}",
                            user.Email,
                            role = user.Role.ToString()
                        }
                    });
                }
                 else
                {
                    var income = await _context.Transactions
                        .Where(t => t.UserId == user.Id && t.Type == TransactionType.Income && t.Status == TransactionStatus.Approved)
                        .SumAsync(t => (decimal?)t.Amount) ?? 0m;

                    var expense = await _context.Transactions
                        .Where(t => t.UserId == user.Id && t.Type == TransactionType.Expense && t.Status == TransactionStatus.Approved)
                        .SumAsync(t => (decimal?)t.Amount) ?? 0m;

                    return Ok(new
                    {
                        message = "Uspešno ste se prijavili.",
                        token,
                        user = new
                        {
                            user.Id,
                            user.Username,
                            FullName = $"{user.FirstName} {user.LastName}",
                            user.Email,
                            user.CashBalance,
                            user.CardBalance,
                            income,
                            expense,
                            role = user.Role.ToString()
                        }
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        private string GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim("userId", user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Role, user.Role.ToString())
            };

            var jwtSection = _config.GetSection("Jwt");
            var keyString  = jwtSection.GetValue<string>("Key") ?? throw new InvalidOperationException("JWT Key is not configured.");
            var issuer     = jwtSection.GetValue<string>("Issuer") ?? "FinTrack";
            var audience   = jwtSection.GetValue<string>("Audience") ?? "FinTrackClient";

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(keyString));
            var creds = new SigningCredentials(key,SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: issuer,
                audience: audience,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(30),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}