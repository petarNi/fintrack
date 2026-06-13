using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FinTrack.Models
{
    public enum CategoryType
    {
        Income,
        Expense
    }

    public class Category
    {
        [Key]
        public int Id { get; set; }

        [Required, StringLength(30, MinimumLength = 3)]
        public string Name { get; set; } = null!;

        [Required]
        [Column(TypeName = "varchar(10)")]
        public CategoryType Type { get; set; }

        public List<Transaction> Transactions { get; set; } = new();
    }
}