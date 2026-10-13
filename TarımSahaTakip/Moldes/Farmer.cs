namespace TarimSahaTakip.Models
{
    public enum VisitStatus
    {
        Planned,
        Completed,
        Cancelled
    }

    public enum VisitType
    {
        Routine,
        Training,
        Inspection,
        Emergency
    }

    public class FarmVisit
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid FarmerId { get; set; }
        public Farmer? Farmer { get; set; }

        public DateTime VisitDate { get; set; }
        public VisitType VisitType { get; set; }
        public string? Notes { get; set; }
        public VisitStatus Status { get; set; }
        public DateTime? NextVisitDate { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}
