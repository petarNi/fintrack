using FinTrack.Models;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace FinTrack.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Category> Categories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<User>()
                .HasMany(u => u.Transactions)
                .WithOne(t => t.User)
                .HasForeignKey(t => t.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Category>()
                .HasMany(c => c.Transactions)
                .WithOne(t => t.Category)
                .HasForeignKey(t => t.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Category>().HasData(
                new Category { Id = 1, Name = "Plata", Type = CategoryType.Income },
                new Category { Id = 2, Name = "Bonus", Type = CategoryType.Income },
                new Category { Id = 3, Name = "Hrana", Type = CategoryType.Expense },
                new Category { Id = 4, Name = "Putovanja", Type = CategoryType.Expense },
                new Category { Id = 5, Name = "Računi", Type = CategoryType.Expense }
            );
            
            modelBuilder.Entity<Transaction>()
                .Property(t => t.Status)
                .ValueGeneratedNever();
        }
    }
}