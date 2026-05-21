using MzadZone.Domain.Payments.Entities;
using MazadZone.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MazadZone.Domain.Shared;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Domain.Payments;

namespace MazadZone.Infrastructure.Persistence.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable(TableNames.Transactions);        

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .HasConversion(new TransactionIdConverter())
            .ValueGeneratedNever();

        builder.Property(t => t.PaymentId)
            .HasConversion(new PaymentIdConverter())
            .IsRequired();

        builder.Property(t => t.GatewayIntentId)
            .HasMaxLength(PaymentConstants.GatewayIntentIdMaxLength)
            .IsRequired();

        builder.Property(t => t.Type)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(t => t.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(t => t.FailureReason)
            .HasMaxLength(SharedConstainst.MaxReasonLength)
            .IsRequired(false);

        builder.Property(t => t.CreatedAtUtc).IsRequired();
        builder.Property(t => t.ProcessedAtUtc).IsRequired(false);

        builder.HasIndex(t => new { t.GatewayIntentId, t.Type });
    }
}
