
namespace FinTrack.Models
{
    public class TransactionTransferDto
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public PaymentMethod FromPaymentMethod { get; set; } 
        public PaymentMethod ToPaymentMethod { get; set; } 
        public string? Description { get; set; }
    }
}
