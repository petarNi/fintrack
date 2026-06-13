using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FinTrack.Data;
using FinTrack.Models;

namespace FinTrack.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class CategoryController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoryController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            try
            {
                var list = await _context.Categories
                    .OrderBy(c => c.Type).ThenBy(c => c.Name)
                    .Select(c => new CategoryDto { Id = c.Id, Name = c.Name, Type = c.Type })
                    .ToListAsync();
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }


        [HttpGet("by-type/{type}")]
        public async Task<IActionResult> GetCategoriesByType(CategoryType type)
        {
            try
            {
                var list = await _context.Categories
                    .Where(c => c.Type == type)
                    .OrderBy(c => c.Name)
                    .Select(c => new CategoryDto { Id = c.Id, Name = c.Name, Type = c.Type })
                    .ToListAsync();
                return Ok(list);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Internal server error", error = ex.Message });
            }
        }
    }
}