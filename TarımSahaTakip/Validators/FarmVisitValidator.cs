
using FluentValidation;
using TarimSahaTakip.Models;

namespace TarimSahaTakip.Validators
{
    public class FarmVisitValidator : AbstractValidator<CreateFarmVisitDto>
    {
        public FarmVisitValidator()
        {
            RuleFor(x => x.FarmerId).NotEmpty().WithMessage("Çiftçi seçimi zorunludur.");
            RuleFor(x => x.VisitDate).NotEmpty().WithMessage("Ziyaret tarihi zorunludur.");

            // İş Kuralı 1: Geçmiş bir tarih için Planned durumunda ziyaret oluşturulamaz.
            RuleFor(x => x)
                .Must(x => !(x.Status == VisitStatus.Planned && x.VisitDate.Date < DateTime.UtcNow.Date))
                .WithMessage("Geçmiş bir tarih için Planned (Planlandı) durumunda ziyaret oluşturulamaz.");

            // İş Kuralı 3: Completed durumundaki ziyaretin Notes alanı boş bırakılamaz.
            RuleFor(x => x)
                .Must(x => !(x.Status == VisitStatus.Completed && string.IsNullOrWhiteSpace(x.Notes)))
                .WithMessage("Tamamlanan (Completed) ziyaretlerin Notlar alanı boş bırakılamaz.");

            // İş Kuralı 4: NextVisitDate, VisitDate değerinden önce olamaz.
            RuleFor(x => x)
                .Must(x => !x.NextVisitDate.HasValue || x.NextVisitDate.Value >= x.VisitDate)
                .WithMessage("Sonraki Ziyaret Tarihi (NextVisitDate), Ziyaret Tarihinden (VisitDate) önce olamaz.");
        }
    }
}