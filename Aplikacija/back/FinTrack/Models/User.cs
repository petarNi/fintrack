using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinTrack.Models
{
    public enum UserRole
    {
        User = 0,
        Admin = 1
    }
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required, EmailAddress]
        public string Email { get; set; } = null!;

        [Required, StringLength(30, MinimumLength = 3)]
        public string Username { get; set; } = null!;

        [Required, StringLength(50, MinimumLength = 6)]
        public string Password { get; set; } = null!;

        [Required, StringLength(50, MinimumLength = 2)]
        public string FirstName { get; set; } = null!;

        [Required, StringLength(50, MinimumLength = 2)]
        public string LastName { get; set; } = null!;

        [Column(TypeName = "decimal(18,2)")]
        public decimal CashBalance { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal CardBalance { get; set; }
        public List<Transaction> Transactions { get; set; } = new();

        public UserRole Role { get; set; } = UserRole.User;
    }

}