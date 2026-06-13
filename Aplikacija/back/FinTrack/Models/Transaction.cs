using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinTrack.Models
{
    public enum TransactionType
    {
        Income = 0,
        Expense = 1,
        Transfer = 2
    }
    public enum PaymentMethod
    {
        Cash = 0,
        Card = 1
    }
    public enum TransactionStatus
    {
        Pending = 0,
        Approved = 1,
        Rejected = 2
    }
    public class Transaction
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public TransactionType Type { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount mora biti pozitivan broj")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [MinLength(3)]
        public string? Description { get; set; }

        [Required]
        public DateTime Date { get; set; } = DateTime.UtcNow;

        public PaymentMethod? PaymentMethod { get; set; }

        public PaymentMethod? FromPaymentMethod { get; set; }
        public PaymentMethod? ToPaymentMethod { get; set; }

        [Required]
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        public int? CategoryId { get; set; }
        public Category? Category { get; set; }

        public TransactionStatus Status { get; set; } = TransactionStatus.Approved;        
    }
}