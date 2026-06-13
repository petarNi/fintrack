
namespace FinTrack.Models
{
    public class TransactionUpdateDto
    {
        public decimal? Amount { get; set; }
        public DateTime? Date { get; set; }
        public string? Description { get; set; }

        public int? CategoryId { get; set; }
        public PaymentMethod? PaymentMethod { get; set; }

        public PaymentMethod? FromPaymentMethod { get; set; }
        public PaymentMethod? ToPaymentMethod { get; set; }
    }
}
