using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinTrack.Models
{

    public class RegisterDto
    {
        [Required, EmailAddress]
        public string Email { get; set; } = null!;
        [Required, StringLength(50, MinimumLength = 6)]
        public string Password { get; set; } = null!;
        [Required, StringLength(30, MinimumLength = 3)]
        public string Username { get; set; } = null!;
        [Required, StringLength(50, MinimumLength = 2)]
        public string FirstName { get; set; } = null!;
        [Required, StringLength(50, MinimumLength = 2)]
        public string LastName { get; set; } = null!;
        [Range(0, double.MaxValue, ErrorMessage = "Balance mora biti pozitivan ili nula")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal? CashBalance { get; set; } = 0;
        [Range(0, double.MaxValue, ErrorMessage = "Balance mora biti pozitivan ili nula")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal? CardBalance { get; set; } = 0;

        public string? AdminCode { get; set; }
    }

}