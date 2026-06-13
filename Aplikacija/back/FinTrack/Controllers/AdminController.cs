using FinTrack.Data;
using FinTrack.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace FinTrack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly AppDbContext _context;
        public AdminController(AppDbContext context) => _context = context;

        [HttpGet("users")]
        public async Task<IActionResult> GetUsers()
        {
            var users = await _context.Users
                .AsNoTracking()
                .Where(u => u.Role == UserRole.User)
                .Select(u => new
                {
                    u.Id,
                    u.Username,
                    u.Email,
                    FullName = $"{u.FirstName} {u.LastName}",
                    u.Role,
                    u.CashBalance,
                    u.CardBalance
                })
                .OrderBy(u => u.Id)
                .ToListAsync();

            return Ok(users);
        }

        [HttpPut("users/{id:int}/role")]
        public async Task<IActionResult> UpdateUserRole(int id, [FromBody] UserRole newRole)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return NotFound(new { message = "Korisnik nije pronađen." });

            user.Role = newRole;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Uloga uspešno ažurirana." });
        }

        [HttpGet("transactions/pending")]
        public async Task<IActionResult> GetPendingTransactions()
        {
            var txs = await _context.Transactions
                .AsNoTracking()
                .Include(t => t.User)
                .Include(t => t.Category)
                .Where(t => t.Status == TransactionStatus.Pending)
                .OrderBy(t => t.Date)
                .Select(t => new
                {
                    t.Id,
                    t.UserId,
                    Username = t.User.Username,
                    t.Type,
                    t.Amount,
                    t.Date,
                    t.Description,
                    t.PaymentMethod,
                    t.FromPaymentMethod,
                    t.ToPaymentMethod,
                    t.CategoryId,
                    CategoryName = t.Category != null ? t.Category.Name : null
                })
                .ToListAsync();

            return Ok(txs);
        }

        [HttpPost("transactions/{id:int}/approve")]
        public async Task<IActionResult> ApproveTransaction(int id)
        {
            var tx = await _context.Transactions
                .Include(t => t.User)
                .FirstOrDefaultAsync(t => t.Id == id && t.Status == TransactionStatus.Pending);

            if (tx == null) return NotFound(new { message = "Pending transakcija nije pronađena." });

            var user = tx.User;

            if (tx.Type == TransactionType.Transfer)
            {
                if (tx.FromPaymentMethod == null || tx.ToPaymentMethod == null)
                    return BadRequest(new { message = "Transfer nema kompletne podatke (From/To)." });

                if (tx.FromPaymentMethod == PaymentMethod.Cash)
                {
                    if (user.CashBalance < tx.Amount)
                        return BadRequest(new { message = "Nema dovoljno keša." });
                    user.CashBalance -= tx.Amount;
                }
                else
                {
                    if (user.CardBalance < tx.Amount)
                        return BadRequest(new { message = "Nema dovoljno sredstava na kartici." });
                    user.CardBalance -= tx.Amount;
                }

                if (tx.ToPaymentMethod == PaymentMethod.Cash) user.CashBalance += tx.Amount;
                else                                          user.CardBalance += tx.Amount;
            }
            else if (tx.Type == TransactionType.Income)
            {
                if (tx.PaymentMethod == PaymentMethod.Cash) user.CashBalance += tx.Amount;
                else                                        user.CardBalance += tx.Amount;
            }
            else
            {
                if (tx.PaymentMethod == PaymentMethod.Cash)
                {
                    if (user.CashBalance < tx.Amount)
                        return BadRequest(new { message = "Nema dovoljno keša." });
                    user.CashBalance -= tx.Amount;
                }
                else
                {
                    if (user.CardBalance < tx.Amount)
                        return BadRequest(new { message = "Nema dovoljno sredstava na kartici." });
                    user.CardBalance -= tx.Amount;
                }
            }

            tx.Status = TransactionStatus.Approved;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Transakcija odobrena." });
        }

        [HttpPost("transactions/{id:int}/reject")]
        public async Task<IActionResult> RejectTransaction(int id)
        {
            var tx = await _context.Transactions
                .FirstOrDefaultAsync(t => t.Id == id && t.Status == TransactionStatus.Pending);

            if (tx == null) return NotFound(new { message = "Pending transakcija nije pronađena." });

            tx.Status = TransactionStatus.Rejected;
            await _context.SaveChangesAsync();

            return Ok(new { message = "Transakcija odbijena." });
        }
    }
}
