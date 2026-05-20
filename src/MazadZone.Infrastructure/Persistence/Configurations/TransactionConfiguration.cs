using MzadZone.Domain.Payments.Entities;
using MazadZone.Domain.Payments.ValueObjects;
using MazadZone.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace MazadZone.Infrastructure.Persistence.Configurations;

public class TransactionConfiguration : IEntityTypeConfiguration<Transaction>
{
    public void Configure(EntityTypeBuilder<Transaction> builder)
    {
        builder.ToTable("Transactions");        

        builder.HasKey(t => t.Id);

        builder.Property(t => t.Id)
            .HasConversion(new ValueConverter<TransactionId, Guid>(id => id.Value, guid => TransactionId.From(guid)))
            .ValueGeneratedNever();

        builder.Property(t => t.PaymentId)
            .HasConversion(new PaymentIdConverter())
            .IsRequired();

        builder.Property(t => t.GatewayIntentId)
            .HasMaxLength(200)
            .IsRequired();

        builder.Property(t => t.Type)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(t => t.Status)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(t => t.FailureReason)
            .HasMaxLength(1000)
            .IsRequired(false);

        builder.Property(t => t.CreatedAtUtc).IsRequired();
        builder.Property(t => t.ProcessedAtUtc).IsRequired(false);

        builder.HasIndex(t => new { t.GatewayIntentId, t.Type });
    }
}
