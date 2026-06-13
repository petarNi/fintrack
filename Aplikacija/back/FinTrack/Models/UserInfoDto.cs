namespace FinTrack.Models
{
    public class UserInfoDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = null!;
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;

        public decimal CashBalance { get; set; }
        public decimal CardBalance { get; set; }

        public decimal TotalIncome { get; set; }
        public decimal TotalExpense { get; set; }

        public decimal CashIncome { get; set; }
        public decimal CashExpense { get; set; }
        public decimal CardIncome { get; set; }
        public decimal CardExpense { get; set; }
    }
}
