
namespace FinTrack.Models
{
    public class TransactionIncExpDto
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public decimal Amount { get; set; }
        public int CategoryId { get; set; }              
        public string CategoryName { get; set; } = string.Empty; 
        public CategoryType CategoryType { get; set; }
        public string? Description { get; set; }
    }
}
