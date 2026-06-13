using System.ComponentModel.DataAnnotations;

namespace FinTrack.Models
{
    public class LoginDto
    {
        [Required]
        public string UsernameOrEmail { get; set; } = null!;
        [Required]
        public string Password { get; set; } = null!;
    }

}