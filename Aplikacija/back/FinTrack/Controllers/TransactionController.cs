using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinTrack.Data;
using FinTrack.Models;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace FinTrack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "User")]
    public class TransactionController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransactionController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId() => int.Parse(User.FindFirst("userId")!.Value);
        private const decimal APPROVAL_LIMIT = 10000m;


        [HttpPost("add")]
        public async Task<IActionResult> AddTransaction([FromBody] TransactionDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var userId = GetUserId();

            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) return Unauthorized();

                var requiresApproval = dto.Amount > APPROVAL_LIMIT;
                var status = requiresApproval ? TransactionStatus.Pending : TransactionStatus.Approved;

                if (dto.Type == TransactionType.Transfer)
                {
                    if (dto.FromPaymentMethod == null || dto.ToPaymentMethod == null)
                        return BadRequest(new { message = "Transfer zahteva FromPaymentMethod i ToPaymentMethod." });

                    if (dto.FromPaymentMethod == dto.ToPaymentMethod)
                        return BadRequest(new { message = "Izvor i odredište transfera moraju biti različiti." });

                    if (!requiresApproval)
                    {
                        if (dto.FromPaymentMethod == PaymentMethod.Cash && user.CashBalance < dto.Amount)
                            return BadRequest(new { message = "Nema dovoljno sredstava u kešu." });

                        if (dto.FromPaymentMethod == PaymentMethod.Card && user.CardBalance < dto.Amount)
                            return BadRequest(new { message = "Nema dovoljno sredstava na kartici." });

                        if (dto.FromPaymentMethod == PaymentMethod.Cash)
                        {
                            user.CashBalance -= dto.Amount;
                            user.CardBalance += dto.Amount;
                        }
                        else
                        {
                            user.CardBalance -= dto.Amount;
                            user.CashBalance += dto.Amount;
                        }
                    }
                    var t = new Transaction
                    {
                        UserId = userId,
                        Amount = dto.Amount,
                        Type = TransactionType.Transfer,
                        FromPaymentMethod = dto.FromPaymentMethod,
                        ToPaymentMethod = dto.ToPaymentMethod,
                        Description = dto.Description,
                        Date = dto.Date ?? DateTime.UtcNow,
                        Status = status
                    };

                    _context.Transactions.Add(t);
                    await _context.SaveChangesAsync();

                    return Ok(new {
                        message = requiresApproval ? "Transfer čeka odobrenje." : "Transfer uspešno dodat.",
                        transactionId = t.Id
                    });
                }
                else
                {
                    if (dto.PaymentMethod == null)
                        return BadRequest(new { message = "Income/Expense zahtevaju PaymentMethod." });

                    if (!dto.CategoryId.HasValue)
                        return BadRequest(new { message = "Income/Expense zahtevaju CategoryId." });

                    var cat = await _context.Categories.FirstOrDefaultAsync(c => c.Id == dto.CategoryId.Value);
                    if (cat == null)
                        return BadRequest(new { message = "Nepostojeća kategorija." });

                    var txnType = (cat.Type == CategoryType.Income)
                        ? TransactionType.Income
                        : TransactionType.Expense;

                    if (!requiresApproval)
                    {
                        if (dto.Type == TransactionType.Expense)
                        {
                            if (dto.PaymentMethod == PaymentMethod.Cash)
                            {
                                if (user.CashBalance < dto.Amount)
                                    return BadRequest(new { message = "Nema dovoljno sredstava u kešu." });
                                user.CashBalance -= dto.Amount;
                            }
                            else
                            {
                                if (user.CardBalance < dto.Amount)
                                    return BadRequest(new { message = "Nema dovoljno sredstava na kartici." });
                                user.CardBalance -= dto.Amount;
                            }
                        }
                        else if (dto.Type == TransactionType.Income)
                        {
                            if (dto.PaymentMethod == PaymentMethod.Cash)
                                user.CashBalance += dto.Amount;
                            else
                                user.CardBalance += dto.Amount;
                        }
                    }
                    var t = new Transaction
                    {
                        UserId = userId,
                        Amount = dto.Amount,
                        Type = txnType,
                        PaymentMethod = dto.PaymentMethod,
                        CategoryId = dto.CategoryId,
                        Description = dto.Description,
                        Date = dto.Date ?? DateTime.UtcNow,
                        Status = status
                    };

                    _context.Transactions.Add(t);
                    await _context.SaveChangesAsync();

                    return Ok(new
                    {
                        message = requiresApproval ? "Transakcija čeka odobrenje." : "Transakcija uspešno dodata.",
                        transactionId = t.Id
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }


        [HttpGet("inc-exp")]
        public async Task<IActionResult> GetIncExp(
            [FromQuery] int? categoryId,
            [FromQuery] DateTime? from,
            [FromQuery] DateTime? to,
            [FromQuery] PaymentMethod? paymentMethod
        )
        {
            var userId = GetUserId();

            try
            {
                var q = _context.Transactions
                    .AsNoTracking()
                    .Include(t => t.Category)
                    .Where(t => t.UserId == userId
                                && t.Status == TransactionStatus.Approved
                                && (t.Type == TransactionType.Income || t.Type == TransactionType.Expense)
                                && t.CategoryId != null);

                if (categoryId.HasValue) q = q.Where(t => t.CategoryId == categoryId.Value);
                if (paymentMethod.HasValue) q = q.Where(t => t.PaymentMethod == paymentMethod.Value);
                if (from.HasValue) q = q.Where(t => t.Date >= from.Value);
                if (to.HasValue) q = q.Where(t => t.Date <= to.Value);

                var items = await q
                    .OrderByDescending(t => t.Date)
                    .Select(t => new TransactionIncExpDto
                    {
                        Id = t.Id,
                        Date = t.Date,
                        Amount = t.Amount,
                        CategoryId = t.CategoryId!.Value,
                        CategoryName = t.Category != null ? t.Category.Name : string.Empty,
                        CategoryType = t.Category != null ? t.Category.Type : CategoryType.Expense,
                        Description = t.Description
                    })
                    .ToListAsync();

                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("transfers")]
        public async Task<IActionResult> GetTransfers(
           [FromQuery] DateTime? from,
           [FromQuery] DateTime? to,
           [FromQuery] PaymentMethod? fromPaymentMethod
       )
        {
            var userId = GetUserId();

            try
            {
                var q = _context.Transactions
                    .AsNoTracking()
                    .Where(t => t.UserId == userId
                                && t.Status == TransactionStatus.Approved
                                && t.Type == TransactionType.Transfer
                                && t.FromPaymentMethod != null
                                && t.ToPaymentMethod != null);

                if (from.HasValue) q = q.Where(t => t.Date >= from.Value);
                if (to.HasValue) q = q.Where(t => t.Date <= to.Value);

                if (fromPaymentMethod.HasValue)
                {
                    q = q.Where(t => t.FromPaymentMethod == fromPaymentMethod.Value);
                }

                var items = await q
                    .OrderByDescending(t => t.Date)
                    .Select(t => new TransactionTransferDto
                    {
                        Id = t.Id,
                        Date = t.Date,
                        Amount = t.Amount,
                        FromPaymentMethod = t.FromPaymentMethod!.Value,
                        ToPaymentMethod = t.ToPaymentMethod!.Value,
                        Description = t.Description
                    })
                    .ToListAsync();

                return Ok(items);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("stats")]
        public async Task<IActionResult> GetStats()
        {
            var userId = GetUserId();

            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) return Unauthorized();

                var q = _context.Transactions
                    .AsNoTracking()
                    .Where(t => t.UserId == userId && t.Status == TransactionStatus.Approved);

                var income = await q.Where(t => t.Type == TransactionType.Income)
                                     .SumAsync(t => (decimal?)t.Amount) ?? 0m;
                var expense = await q.Where(t => t.Type == TransactionType.Expense)
                                     .SumAsync(t => (decimal?)t.Amount) ?? 0m;

                var cashIncome = await q.Where(t => t.Type == TransactionType.Income && t.PaymentMethod == PaymentMethod.Cash)
                                         .SumAsync(t => (decimal?)t.Amount) ?? 0m;
                var cashExpense = await q.Where(t => t.Type == TransactionType.Expense && t.PaymentMethod == PaymentMethod.Cash)
                                         .SumAsync(t => (decimal?)t.Amount) ?? 0m;
                var cardIncome = await q.Where(t => t.Type == TransactionType.Income && t.PaymentMethod == PaymentMethod.Card)
                                         .SumAsync(t => (decimal?)t.Amount) ?? 0m;
                var cardExpense = await q.Where(t => t.Type == TransactionType.Expense && t.PaymentMethod == PaymentMethod.Card)
                                         .SumAsync(t => (decimal?)t.Amount) ?? 0m;

                var byCategory = await _context.Transactions
                    .AsNoTracking()
                    .Include(t => t.Category)
                    .Where(t => t.UserId == userId &&
                                t.Status == TransactionStatus.Approved &&
                                t.CategoryId != null &&
                                t.Type != TransactionType.Transfer)
                    .GroupBy(t => new { t.CategoryId, t.Category!.Name, t.Category!.Type })
                    .Select(g => new CategoryStatDto
                    {
                        CategoryId = g.Key.CategoryId!.Value,
                        CategoryName = g.Key.Name,
                        CategoryType = g.Key.Type,
                        Total = g.Where(x =>
                                    (g.Key.Type == CategoryType.Income && x.Type == TransactionType.Income) ||
                                    (g.Key.Type == CategoryType.Expense && x.Type == TransactionType.Expense))
                                 .Sum(x => (decimal?)x.Amount) ?? 0m
                    })
                    .OrderByDescending(x => x.Total)
                    .ToListAsync();

                return Ok(new
                {
                    user.CashBalance,
                    user.CardBalance,
                    totals = new { income, expense, net = income - expense },
                    method = new
                    {
                        cash = new { income = cashIncome, expense = cashExpense },
                        card = new { income = cardIncome, expense = cardExpense }
                    },
                    byCategory
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }


        [HttpGet("stats/period")]
        public async Task<IActionResult> GetMonthlyStats([FromQuery] int? year, [FromQuery] bool allYears = false)
        {
            var userId = GetUserId();

            try
            {

                var user = await _context.Users.FindAsync(userId);
                if (user == null) return Unauthorized();

                var baseQuery = _context.Transactions
                    .AsNoTracking()
                    .Where(t => t.UserId == userId && t.Status == TransactionStatus.Approved);

                if (!allYears)
                {
                    int targetYear = year ?? DateTime.UtcNow.Year;

                    var grouped = await baseQuery
                        .Where(t => t.Date.Year == targetYear)
                        .GroupBy(t => t.Date.Month)
                        .Select(g => new
                        {
                            Month = g.Key,
                            Income = g.Where(t => t.Type == TransactionType.Income).Sum(t => (decimal?)t.Amount) ?? 0m,
                            Expense = g.Where(t => t.Type == TransactionType.Expense).Sum(t => (decimal?)t.Amount) ?? 0m,
                            Transfer = g.Where(t => t.Type == TransactionType.Transfer).Sum(t => (decimal?)t.Amount) ?? 0m
                        })
                        .ToListAsync();

                    var result = Enumerable.Range(1, 12)
                        .Select(m =>
                        {
                            var hit = grouped.FirstOrDefault(x => x.Month == m);
                            return new
                            {
                                Year = targetYear,
                                Month = m,
                                MonthName = System.Globalization.CultureInfo.CurrentCulture.DateTimeFormat.GetMonthName(m),
                                Income = hit?.Income ?? 0m,
                                Expense = hit?.Expense ?? 0m,
                                Transfer = hit?.Transfer ?? 0m,
                                Net = (hit?.Income ?? 0m) - (hit?.Expense ?? 0m)
                            };
                        })
                        .ToList();

                    return Ok(new
                    {
                        scope = "year",
                        year = targetYear,
                        months = result
                    });
                }
                else
                {
                    var groupedByYear  = await baseQuery
                        .GroupBy(t => t.Date.Year)
                        .Select(g => new
                        {
                            Year = g.Key,
                            Income = g.Where(t => t.Type == TransactionType.Income).Sum(t => (decimal?)t.Amount) ?? 0m,
                            Expense = g.Where(t => t.Type == TransactionType.Expense).Sum(t => (decimal?)t.Amount) ?? 0m,
                            Transfer = g.Where(t => t.Type == TransactionType.Transfer).Sum(t => (decimal?)t.Amount) ?? 0m
                        })
                        .OrderBy(x => x.Year)
                        .ToListAsync();

                    var result = groupedByYear .Select(x => new
                    {
                        x.Year,
                        x.Income,
                        x.Expense,
                        x.Transfer,
                        Net = x.Income - x.Expense
                    });

                    return Ok(new
                    {
                        scope = "allYears",
                        years  = result
                    });
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> UpdateTransaction(int id, [FromBody] TransactionUpdateDto dto)
        {
            var userId = GetUserId();

            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) return Unauthorized();

                var tx = await _context.Transactions
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

                if (tx == null)
                    return NotFound(new { message = "Transakcija nije pronađena." });

                var oldAmount = tx.Amount;
                var oldType = tx.Type;
                var oldPaymentMethod = tx.PaymentMethod;
                var oldFrom = tx.FromPaymentMethod;
                var oldTo = tx.ToPaymentMethod;

                var newAmount = dto.Amount ?? tx.Amount;
                if (newAmount <= 0m)
                    return BadRequest(new { message = "Iznos mora biti pozitivan." });

                var newDate = dto.Date ?? tx.Date;
                var newDesc = (dto.Description != null)
                    ? (string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim())
                    : tx.Description;

                if (tx.Status != TransactionStatus.Approved)
                {
                    if (oldType == TransactionType.Transfer)
                    {
                        tx.FromPaymentMethod = dto.FromPaymentMethod ?? oldFrom;
                        tx.ToPaymentMethod = dto.ToPaymentMethod ?? oldTo;

                        if (tx.FromPaymentMethod == null || tx.ToPaymentMethod == null)
                            return BadRequest(new { message = "Za transfer su potrebni FromPaymentMethod i ToPaymentMethod." });

                        if (tx.FromPaymentMethod == tx.ToPaymentMethod)
                            return BadRequest(new { message = "From i To ne mogu biti isti kod transfera." });

                        tx.PaymentMethod = null;
                        tx.CategoryId = null;
                    }
                    else
                    {
                        tx.PaymentMethod = dto.PaymentMethod ?? oldPaymentMethod;

                        if (dto.CategoryId.HasValue)
                        {
                            var neededType = (oldType == TransactionType.Income) ? CategoryType.Income : CategoryType.Expense;
                            var cat = await _context.Categories
                                .FirstOrDefaultAsync(c => c.Id == dto.CategoryId.Value && c.Type == neededType);

                            if (cat == null)
                                return BadRequest(new { message = "Kategorija ne postoji ili tip ne odgovara." });

                            tx.CategoryId = cat.Id;
                        }

                        tx.FromPaymentMethod = null;
                        tx.ToPaymentMethod = null;

                        if (tx.PaymentMethod == null)
                            return BadRequest(new { message = "PaymentMethod je obavezan za prihod/rashod." });
                    }

                    tx.Amount = newAmount;
                    tx.Date = newDate;
                    tx.Description = newDesc;

                    await _context.SaveChangesAsync();
                    return Ok(new { message = "Transakcija uspešno ažurirana." });
                }

                if (oldType == TransactionType.Transfer)
                {
                    var newFrom = dto.FromPaymentMethod ?? oldFrom;
                    var newTo = dto.ToPaymentMethod ?? oldTo;

                    if (newFrom == null || newTo == null)
                        return BadRequest(new { message = "Za transfer su potrebni FromPaymentMethod i ToPaymentMethod." });

                    if (newFrom == newTo)
                        return BadRequest(new { message = "From i To ne mogu biti isti kod transfera." });

                    if (oldFrom == PaymentMethod.Cash) user.CashBalance += oldAmount;
                    else                                user.CardBalance += oldAmount;

                    if (oldTo == PaymentMethod.Cash)   user.CashBalance -= oldAmount;
                    else                                user.CardBalance -= oldAmount;

                    if (newFrom == PaymentMethod.Cash)
                    {
                        if (user.CashBalance < newAmount)
                            return BadRequest(new { message = "Nema dovoljno sredstava u kešu za transfer." });
                        user.CashBalance -= newAmount;
                    }
                    else
                    {
                        if (user.CardBalance < newAmount)
                            return BadRequest(new { message = "Nema dovoljno sredstava na kartici za transfer." });
                        user.CardBalance -= newAmount;
                    }

                    if (newTo == PaymentMethod.Cash) user.CashBalance += newAmount;
                    else                             user.CardBalance += newAmount;

                    tx.Amount = newAmount;
                    tx.Date = newDate;
                    tx.Description = newDesc;
                    tx.FromPaymentMethod = newFrom;
                    tx.ToPaymentMethod = newTo;
                    tx.PaymentMethod = null;
                    tx.CategoryId = null;
                }
                else
                {
                    var newPaymentMethod = dto.PaymentMethod ?? oldPaymentMethod;
                    if (newPaymentMethod == null)
                        return BadRequest(new { message = "PaymentMethod je obavezan za prihod/rashod." });

                    if (dto.CategoryId.HasValue)
                    {
                        var neededType = (oldType == TransactionType.Income) ? CategoryType.Income : CategoryType.Expense;
                        var cat = await _context.Categories
                            .FirstOrDefaultAsync(c => c.Id == dto.CategoryId.Value && c.Type == neededType);

                        if (cat == null)
                            return BadRequest(new { message = "Kategorija ne postoji ili tip ne odgovara." });

                        tx.CategoryId = cat.Id;
                    }

                    if (oldType == TransactionType.Income)
                    {
                        if (oldPaymentMethod == PaymentMethod.Cash) user.CashBalance -= oldAmount;
                        else                                        user.CardBalance -= oldAmount;
                    }
                    else
                    {
                        if (oldPaymentMethod == PaymentMethod.Cash) user.CashBalance += oldAmount;
                        else                                        user.CardBalance += oldAmount;
                    }

                    if (oldType == TransactionType.Income)
                    {
                        if (newPaymentMethod == PaymentMethod.Cash) user.CashBalance += newAmount;
                        else                                        user.CardBalance += newAmount;
                    }
                    else
                    {
                        if (newPaymentMethod == PaymentMethod.Cash)
                        {
                            if (user.CashBalance < newAmount)
                                return BadRequest(new { message = "Nema dovoljno sredstava u kešu za rashod." });
                            user.CashBalance -= newAmount;
                        }
                        else
                        {
                            if (user.CardBalance < newAmount)
                                return BadRequest(new { message = "Nema dovoljno sredstava na kartici za rashod." });
                            user.CardBalance -= newAmount;
                        }
                    }

                    tx.Amount = newAmount;
                    tx.Date = newDate;
                    tx.Description = newDesc;
                    tx.PaymentMethod = newPaymentMethod;
                    tx.FromPaymentMethod = null;
                    tx.ToPaymentMethod = null;
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Transakcija uspešno ažurirana." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var userId = GetUserId();

            var t = await _context.Transactions
                .AsNoTracking()
                .Include(x => x.Category)
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

            if (t == null)
                return NotFound(new { message = "Transakcija nije pronađena." });

            return Ok(new
            {
                id = t.Id,
                type = t.Type,
                date = t.Date,
                amount = t.Amount,
                description = t.Description,
                categoryId = t.CategoryId,
                categoryName = t.Category?.Name,
                paymentMethod = t.PaymentMethod,
                fromPaymentMethod = t.FromPaymentMethod,
                toPaymentMethod = t.ToPaymentMethod,
                status = t.Status
            });
        }
        
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> DeleteTransaction(int id)
        {
            var userId = GetUserId();

            try
            {
                var user = await _context.Users.FindAsync(userId);
                if (user == null) return Unauthorized();

                var tx = await _context.Transactions
                    .FirstOrDefaultAsync(t => t.Id == id && t.UserId == userId);

                if (tx == null)
                    return NotFound(new { message = "Transakcija nije pronađena." });

                if (tx.Status == TransactionStatus.Approved)
                {
                    if (tx.Type == TransactionType.Transfer)
                    {
                        if (tx.FromPaymentMethod == null || tx.ToPaymentMethod == null)
                            return BadRequest(new { message = "Transfer nema kompletne podatke (From/To)." });

                        if (tx.ToPaymentMethod == PaymentMethod.Cash)
                        {
                            if (user.CashBalance < tx.Amount)
                                return BadRequest(new { message = "Nema dovoljno keša da se poništi efekat transfera (umanjenje To)." });
                            user.CashBalance -= tx.Amount;
                        }
                        else
                        {
                            if (user.CardBalance < tx.Amount)
                                return BadRequest(new { message = "Nema dovoljno sredstava na kartici da se poništi efekat transfera (umanjenje To)." });
                            user.CardBalance -= tx.Amount;
                        }

                        if (tx.FromPaymentMethod == PaymentMethod.Cash)
                            user.CashBalance += tx.Amount;
                        else
                            user.CardBalance += tx.Amount;
                    }
                    else if (tx.Type == TransactionType.Income)
                    {
                        if (tx.PaymentMethod == null)
                            return BadRequest(new { message = "Nedostaje PaymentMethod za income transakciju." });

                        if (tx.PaymentMethod == PaymentMethod.Cash)
                        {
                            if (user.CashBalance < tx.Amount)
                                return BadRequest(new { message = "Nema dovoljno keša da se poništi efekat prihoda." });
                            user.CashBalance -= tx.Amount;
                        }
                        else
                        {
                            if (user.CardBalance < tx.Amount)
                                return BadRequest(new { message = "Nema dovoljno sredstava na kartici da se poništi efekat prihoda." });
                            user.CardBalance -= tx.Amount;
                        }
                    }
                    else
                    {
                        if (tx.PaymentMethod == null)
                            return BadRequest(new { message = "Nedostaje PaymentMethod za rashodnu transakciju." });

                        if (tx.PaymentMethod == PaymentMethod.Cash)
                            user.CashBalance += tx.Amount;
                        else
                            user.CardBalance += tx.Amount;
                    }
                }
                _context.Transactions.Remove(tx);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Transakcija obrisana." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}