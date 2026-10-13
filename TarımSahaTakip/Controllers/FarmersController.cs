using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using TarimSahaTakip.Data;
using TarimSahaTakip.Models;

namespace TarimSahaTakip.Controllers
{
    [ApiController]
    [Route("api/farmers")]
    public class FarmersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public FarmersController(AppDbContext context) => _context = context;

        [HttpGet]
        public async Task<IActionResult> GetFarmers([FromQuery] string? search, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            var query = _context.Farmers.AsQueryable();

            if (!string.IsNullOrWhiteSpace(search))
            {
                var s = search.ToLower();
                query = query.Where(f => f.FullName.ToLower().Contains(s) ||
                                         f.Region.ToLower().Contains(s) ||
                                         f.PhoneNumber.Contains(s));
            }

            var totalCount = await query.CountAsync();
            var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

            return Ok(new PagedResult<Farmer>
            {
                Items = items,
                TotalCount = totalCount,
                Page = page,
                PageSize = pageSize
            });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFarmer(Guid id)
        {
            var farmer = await _context.Farmers.FindAsync(id);
            if (farmer == null) return NotFound("Çiftçi bulunamadı.");
            return Ok(farmer);
        }

        [HttpPost]
        public async Task<IActionResult> CreateFarmer([FromBody] CreateFarmerDto dto)
        {
            var farmer = new Farmer
            {
                FullName = dto.FullName,
                NationalId = dto.NationalId,
                PhoneNumber = dto.PhoneNumber,
                Region = dto.Region,
                District = dto.District
            };

            _context.Farmers.Add(farmer);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetFarmer), new { id = farmer.Id }, farmer);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateFarmer(Guid id, [FromBody] CreateFarmerDto dto)
        {
            var farmer = await _context.Farmers.FindAsync(id);
            if (farmer == null) return NotFound("Çiftçi bulunamadı.");

            farmer.FullName = dto.FullName;
            farmer.NationalId = dto.NationalId;
            farmer.PhoneNumber = dto.PhoneNumber;
            farmer.Region = dto.Region;
            farmer.District = dto.District;

            await _context.SaveChangesAsync();
            return Ok(farmer);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteFarmer(Guid id)
        {
            var farmer = await _context.Farmers.Include(f => f.FarmVisits).FirstOrDefaultAsync(f => f.Id == id);
            if (farmer == null) return NotFound("Çiftçi bulunamadı.");

            // İş Kuralı 6: Bağlı ziyaret kaydı bulunan çiftçi silinemez.
            if (farmer.FarmVisits.Any())
            {
                return BadRequest(new { message = "Bağlı ziyaret kaydı bulunan çiftçi silinemez!" });
            }

            _context.Farmers.Remove(farmer);
            await _context.SaveChangesAsync();
            return NoContent();
        }
    }
}