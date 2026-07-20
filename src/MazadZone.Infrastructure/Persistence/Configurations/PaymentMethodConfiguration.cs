using MazadZone.Domain.Users.Entities;
using MazadZone.Domain.Users.ValueObjects;
using MazadZone.Domain.Users;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazadZone.Infrastructure.Persistence.Configurations;

public sealed class PaymentMethodConfiguration : IEntityTypeConfiguration<PaymentMethod>
{
    public void Configure(EntityTypeBuilder<PaymentMethod> builder)
    {
        builder.ToTable(TableNames.PaymentMethods);

        builder.HasKey(pm => pm.Id);

        builder.Property(pm => pm.Id)
            .HasConversion(new PaymentMethodIdConverter())
            .ValueGeneratedNever();

        builder.Property(pm => pm.UserId)
            .HasConversion(new UserIdConverter())
            .IsRequired();

        builder.Property(pm => pm.Last4Digits)
            .HasMaxLength(PaymentMethodConstants.Last4DigitsLength)
            .IsRequired();

        builder.Property(pm => pm.ExpiryMonth)
            .IsRequired();

        builder.Property(pm => pm.ExpiryYear)
            .IsRequired();

        builder.Property(pm => pm.CardholderName)
            .HasMaxLength(PaymentMethodConstants.CardholderNameMaxLength)
            .IsRequired();

        builder.Property(pm => pm.Brand)
            .HasConversion<int>()
            .IsRequired();

        builder.Property(pm => pm.GatewayToken)
            .HasMaxLength(PaymentMethodConstants.GatewayTokenMaxLength)
            .IsRequired();

        builder.Property(pm => pm.IsDefault)
            .IsRequired();

        builder.Property(pm => pm.CreatedOnUtc).IsRequired();
        builder.Property(pm => pm.ModifiedOnUtc).IsRequired(false);

        // Index to speed up per-user queries
        builder.HasIndex(pm => pm.UserId)
            .HasDatabaseName("IX_PaymentMethods_UserId");

        // Relationship configured in UserConfiguration: User.PaymentMethods (HasMany -> WithOne)
    }
}
