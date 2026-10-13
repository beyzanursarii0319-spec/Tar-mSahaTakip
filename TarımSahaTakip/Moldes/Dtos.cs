namespace TarimSahaTakip.Models
{
    public class PagedResult<T>
    {
        public List<T> Items { get; set; } = new();
        public int TotalCount { get; set; }
        public int Page { get; set; }
        public int PageSize { get; set; }
    }

    public class CreateFarmerDto
    {
        public string FullName { get; set; } = string.Empty;
        public string NationalId { get; set; } = string.Empty;
        public string PhoneNumber { get; set; } = string.Empty;
        public string Region { get; set; } = string.Empty;
        public string District { get; set; } = string.Empty;
    }

    public class CreateFarmVisitDto
    {
        public Guid FarmerId { get; set; }
        public DateTime VisitDate { get; set; }
        public VisitType VisitType { get; set; }
        public string? Notes { get; set; }
        public VisitStatus Status { get; set; }
        public DateTime? NextVisitDate { get; set; }
    }

    public class UpdateFarmVisitDto : CreateFarmVisitDto { }

    public class DashboardSummaryDto
    {
        public int TotalFarmers { get; set; }
        public int TotalVisits { get; set; }
        public int PlannedVisits { get; set; }
        public int CompletedVisits { get; set; }
        public List<FarmVisitResponseDto> UpcomingSevenDaysVisits { get; set; } = new();
    }

    public class FarmVisitResponseDto
    {
        public Guid Id { get; set; }
        public Guid FarmerId { get; set; }
        public string FarmerName { get; set; } = string.Empty;
        public DateTime VisitDate { get; set; }
        public string VisitType { get; set; } = string.Empty;
        public string? Notes { get; set; }
        public string Status { get; set; } = string.Empty;
        public DateTime? NextVisitDate { get; set; }
    }
}
