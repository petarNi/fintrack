namespace FinTrack.Models
{
    public class CategoryStatDto
    {
        public int CategoryId { get; set; }
        public string CategoryName { get; set; } = string.Empty;
        public CategoryType CategoryType { get; set; }
        public decimal Total { get; set; }
    }
}
