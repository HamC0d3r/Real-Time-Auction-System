using MazadZone.Domain.ValueObjects;
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
                .HasColumnName("CapturedHoldedAmount")
                .IsRequired();

            money.Property(m => m.Currency)
                    .HasColumnName("CapturedHoldedCurrency")
                    .HasMaxLength(3) // Optional but recommended
                    .HasConversion(
                        currency => currency.Code,
                        code => Currency.FromCode(code)
                    )
                    .IsRequired();
        });

        builder.ComplexProperty(p => p.CapturedRemainingAmount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("CapturedRemainingAmount")
                .IsRequired();

            money.Property(m => m.Currency)
        .HasColumnName("CapturedRemainingCurrency")
        .HasMaxLength(3)
        .HasConversion(
            currency => currency.Code,
            code => Currency.FromCode(code)
        )
        .IsRequired();
        });

        builder.Property(p => p.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(p => p.CreatedAtUtc).IsRequired();
        builder.Property(p => p.CompletedAtUtc).IsRequired(false);
        builder.Property(p => p.CapturedAuthHoldAtUtc).IsRequired(false);


        // Relationship with Transactions
        builder.HasMany(p => p.Transactions)
            .WithOne()
            .HasForeignKey(t => t.PaymentId) 
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(p => p.Transactions)
            .HasField("_transactions")
            .UsePropertyAccessMode(PropertyAccessMode.Field);


        builder.Ignore(p => p.TotalCapturedAmount);
    }
}