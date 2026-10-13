using Microsoft.EntityFrameworkCore;
using TarimSahaTakip.Models;

namespace TarimSahaTakip.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<Farmer> Farmers { get; set; }
        public DbSet<FarmVisit> FarmVisits { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Farmer>()
                .HasIndex(f => f.NationalId).IsUnique();

            modelBuilder.Entity<Farmer>()
                .HasMany(f => f.FarmVisits)
                .WithOne(v => v.Farmer)
                .HasForeignKey(v => v.FarmerId)
                .OnDelete(DeleteBehavior.Restrict);

            var farmerId = Guid.NewGuid();
            modelBuilder.Entity<Farmer>().HasData(new Farmer
            {
                Id = farmerId,
                FullName = "Ahmet Yılmaz",
                NationalId = "12345678901",
                PhoneNumber = "05321234567",
                Region = "İç Anadolu",
                District = "Polatlı",
                CreatedAt = DateTime.UtcNow
            });

            modelBuilder.Entity<FarmVisit>().HasData(new FarmVisit
            {
                Id = Guid.NewGuid(),
                FarmerId = farmerId,
                VisitDate = DateTime.UtcNow.AddDays(2),
                VisitType = VisitType.Routine,
                Status = VisitStatus.Planned,
                Notes = "Rutin kontrol planlandı",
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            });
        }
    }
}
