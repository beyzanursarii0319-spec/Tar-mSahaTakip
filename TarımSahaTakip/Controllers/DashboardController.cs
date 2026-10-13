using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TarimSahaTakip.Data;
using TarimSahaTakip.Models;

namespace TarimSahaTakip.Controllers
{
    [ApiController]
    [Route("api/dashboard")]
    public class DashboardController : ControllerBase
    {
        private readonly AppDbContext _context;

        public DashboardController(AppDbContext context) => _context = context;

        [HttpGet("summary")]
        public async Task<IActionResult> GetSummary()
        {
            var now = DateTime.UtcNow.Date;
            var nextSevenDays = now.AddDays(7);

            var totalFarmers = await _context.Farmers.CountAsync();
            var totalVisits = await _context.FarmVisits.CountAsync();
            var plannedVisits = await _context.FarmVisits.CountAsync(v => v.Status == VisitStatus.Planned);
            var completedVisits = await _context.FarmVisits.CountAsync(v => v.Status == VisitStatus.Completed);

            var upcomingVisits = await _context.FarmVisits
                .Include(v => v.Farmer)
                .Where(v => v.VisitDate.Date >= now && v.VisitDate.Date <= nextSevenDays)
                .OrderBy(v => v.VisitDate)
                .Select(v => new FarmVisitResponseDto
                {
                    Id = v.Id,
                    FarmerId = v.FarmerId,
                    FarmerName = v.Farmer != null ? v.Farmer.FullName : "Bilinmiyor",
                    VisitDate = v.VisitDate,
                    VisitType = v.VisitType.ToString(),
                    Notes = v.Notes,
                    Status = v.Status.ToString(),
                    NextVisitDate = v.NextVisitDate
                }).ToListAsync();

            return Ok(new DashboardSummaryDto
            {
                TotalFarmers = totalFarmers,
                TotalVisits = totalVisits,
                PlannedVisits = plannedVisits,
                CompletedVisits = completedVisits,
                UpcomingSevenDaysVisits = upcomingVisits
            });
        }
    }
}
