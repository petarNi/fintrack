using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinTrack.Data;
using FinTrack.Models;
using Microsoft.AspNetCore.Authorization;

namespace FinTrack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "User")]
    public class UserController : ControllerBase
    {
        private readonly AppDbContext _context;
        public UserController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId() => int.Parse(User.FindFirst("userId")!.Value);

        [HttpGet("Myinfo")]
        public async Task<IActionResult> GetUserInfo()
        {
            var userId = GetUserId();
            try
            {
                var user = await _context.Users.FindAsync(userId);
            if (user == null) return NotFound("Korisnik nije pronadjen.");

            var tx = await _context.Transactions
                .Where(t => t.UserId == userId)
                .ToListAsync();

            var dto = new UserInfoDto
            {
                UserId = user.Id,
                Username = user.Username,
                FullName = $"{user.FirstName} {user.LastName}",
                Email = user.Email,
                CashBalance = user.CashBalance,
                CardBalance = user.CardBalance,
                TotalIncome = tx.Where(t => t.Type == TransactionType.Income).Sum(t => t.Amount),
                TotalExpense = tx.Where(t => t.Type == TransactionType.Expense).Sum(t => t.Amount),
                CashIncome = tx.Where(t => t.Type == TransactionType.Income && t.PaymentMethod == PaymentMethod.Cash).Sum(t => t.Amount),
                CashExpense = tx.Where(t => t.Type == TransactionType.Expense && t.PaymentMethod == PaymentMethod.Cash).Sum(t => t.Amount),
                CardIncome = tx.Where(t => t.Type == TransactionType.Income && t.PaymentMethod == PaymentMethod.Card).Sum(t => t.Amount),
                CardExpense = tx.Where(t => t.Type == TransactionType.Expense && t.PaymentMethod == PaymentMethod.Card).Sum(t => t.Amount)
            };

            return Ok(dto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
        [HttpGet("balance")]
        public async Task<IActionResult> GetTotalBalance()
        {
            var userId = GetUserId();
                
            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) return Unauthorized();

                return Ok(new
                {
                    TotalBalance = user.CashBalance + user.CardBalance
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}