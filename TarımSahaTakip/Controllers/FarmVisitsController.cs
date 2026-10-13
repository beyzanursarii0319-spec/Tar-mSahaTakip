using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TarimSahaTakip.Data;
using TarimSahaTakip.Models;

namespace TarimSahaTakip.Controllers
{
    [ApiController]
    [Route("api/farm-visits")]
    public class FarmVisitsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FarmVisitsController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetVisits(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] VisitStatus? status = null,
            [FromQuery] Guid? farmerId = null,
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            var query = _context.FarmVisits.Include(v => v.Farmer).AsQueryable();

            if (status.HasValue) query = query.Where(v => v.Status == status.Value);
            if (farmerId.HasValue) query = query.Where(v => v.FarmerId == farmerId.Value);
            if (startDate.HasValue) query = query.Where(v => v.VisitDate.Date >= startDate.Value.Date);
            if (endDate.HasValue) query = query.Where(v => v.VisitDate.Date <= endDate.Value.Date);

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize)
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

            return Ok(new PagedResult<FarmVisitResponseDto>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        [HttpPost]
        public async Task<IActionResult> CreateVisit([FromBody] CreateFarmVisitDto dto)
        {
            // İş Kuralı 5: Aynı çiftçi için aynı gün ve aynı ziyaret türünde ikinci kayıt oluşturulamaz.
            var duplicateExists = await _context.FarmVisits.AnyAsync(v =>
                v.FarmerId == dto.FarmerId &&
                v.VisitDate.Date == dto.VisitDate.Date &&
                v.VisitType == dto.VisitType);

            if (duplicateExists)
            {
                return BadRequest(new { message = "Bu çiftçi için aynı gün ve aynı ziyaret türünde zaten bir kayıt bulunmaktadır." });
            }

            var visit = new FarmVisit
            {
                FarmerId = dto.FarmerId,
                VisitDate = dto.VisitDate,
                VisitType = dto.VisitType,
                Notes = dto.Notes,
                Status = dto.Status,
                NextVisitDate = dto.NextVisitDate
            };

            _context.FarmVisits.Add(visit);
            await _context.SaveChangesAsync();
            return Ok(visit);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateVisit(Guid id, [FromBody] UpdateFarmVisitDto dto)
        {
            var visit = await _context.FarmVisits.FindAsync(id);
            if (visit == null) return NotFound("Ziyaret kaydı bulunamadı.");

            // İş Kuralı 2: Completed durumundaki bir ziyaret tekrar Planned durumuna alınamaz.
            if (visit.Status == VisitStatus.Completed && dto.Status == VisitStatus.Planned)
            {
                return BadRequest(new { message = "Tamamlanmış (Completed) bir ziyaret tekrar Planlandı (Planned) durumuna getirilemez." });
            }

            visit.VisitDate = dto.VisitDate;
            visit.VisitType = dto.VisitType;
            visit.Notes = dto.Notes;
            visit.Status = dto.Status;
            visit.NextVisitDate = dto.NextVisitDate;
            visit.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
            return Ok(visit);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVisit(Guid id)
        {
            var visit = await _context.FarmVisits.FindAsync(id);
            if (visit == null) return NotFound("Ziyaret bulunamadı.");

            _context.FarmVisits.Remove(visit);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}