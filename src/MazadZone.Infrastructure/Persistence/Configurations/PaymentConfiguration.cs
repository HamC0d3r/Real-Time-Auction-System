using MazadZone.Domain.Payments;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MzadZone.Domain.Payments;

namespace MazadZone.Infrastructure.Persistence.Configurations;

public class PaymentConfiguration : IEntityTypeConfiguration<Payment>
{
    public void Configure(EntityTypeBuilder<Payment> builder)
    {
        builder.ToTable(TableNames.Payments);

        builder.HasKey(p => p.Id);

        builder.Property(p => p.Id)
            .HasConversion(new PaymentIdConverter())
            .ValueGeneratedNever();

        builder.Property(p => p.OrderId)
            .HasConversion(new OrderIdConverter())
            .IsRequired();

        builder.Property(p => p.UserId)
            .HasConversion(new UserIdIdConverter())
            .IsRequired();

        builder.ComplexProperty(p => p.CapturedHoldedAmount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("CapturedHoldedAmount");

            money.Property(m => m.Currency)
                .HasConversion<string>();
        });

        builder.ComplexProperty(p => p.CapturedRemainingAmount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("CapturedRemainingAmount");

            money.Property(m => m.Currency)
                .HasConversion<string>();
        });

        builder.Property(p => p.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(p => p.CreatedAtUtc).IsRequired();
        builder.Property(p => p.CompletedAtUtc).IsRequired(false);
        builder.Property(p => p.CapturedAuthHoldAtUtc).IsRequired(false);

        builder.HasMany(p => p.Transactions)
            .WithOne()
            .HasForeignKey("PaymentId")
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        builder.Ignore(p => p.TotalCapturedAmount);
    }
}