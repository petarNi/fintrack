using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinTrack.Models
{
    public class TransactionDto
    {
        [Required]
        public TransactionType Type { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount mora biti pozitivan broj")]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }

        [MinLength(3)]
        public string? Description { get; set; }

         public DateTime? Date { get; set; }

        public PaymentMethod? PaymentMethod { get; set; }
        public PaymentMethod? FromPaymentMethod { get; set; }
        public PaymentMethod? ToPaymentMethod { get; set; }

        public int? CategoryId { get; set; }
    }
}