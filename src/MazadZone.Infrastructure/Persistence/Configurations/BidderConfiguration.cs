using System.Text.Json;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Bidders;
using MazadZone.Domain.ValueObjects;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Infrastructure.Persistence.Converters; // Adjust if your converters are elsewhere
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MazadZone.Infrastructure.Persistence.Extensions;

namespace MazadZone.Infrastructure.Persistence.Configurations;

internal sealed class BidderConfiguration : IEntityTypeConfiguration<Bidder>
{
    public void Configure(EntityTypeBuilder<Bidder> builder)
    {
        builder.ToTable(TableNames.Bidders);

        // Primary Key
        builder.HasKey(b => b.Id);
        builder.Property(b => b.Id)
               .HasConversion(new BidderIdConverter()) // Ensure you have this converter
               .ValueGeneratedNever();

        // Primitives
        builder.Property(b => b.NationalId).HasMaxLength(50).IsRequired();
        builder.Property(b => b.TotalWins).IsRequired();
        builder.Property(b => b.SuccessfulPayments).IsRequired();
        builder.Property(b => b.IsVerified).IsRequired();
        builder.Property(b => b.CreatedOnUtc).IsRequired();
        builder.Property(b => b.ModifiedOnUtc).IsRequired(false);

        // Ignored Computed Properties
        builder.Ignore(b => b.UnpaidWins);
        builder.Ignore(b => b.UnpaidAuctions); // We map the backing field below instead

     builder.Property<HashSet<AuctionId>>("_unpaidAuctions")
    .HasColumnName("UnpaidAuctions")
    .HasColumnType("nvarchar(max)")
    .HasConversion(new AuctionIdSetConverter()) // 👈 Use the CONVERTER here
    .Metadata.SetValueComparer(new AuctionIdSetComparer()); // 👈 Use the COMPARER here

        // Value Object: TotalAmountSpent
        builder.ComplexProperty(b => b.TotalAmountSpent, moneyBuilder =>
        {
            moneyBuilder.Property(m => m.Amount)
                .HasColumnName("TotalAmountSpent")
                .HasColumnType("decimal(18, 4)")
                .IsRequired();

            moneyBuilder.Property(m => m.Currency)
                .HasColumnName("Currency")
                .HasMaxLength(3)
                .HasConversion(c => c.Code, code => Currency.FromCode(code)) // Adjust if using enum
                .IsRequired();
        });

        // Value Object: ActiveBidsTotal
        builder.ComplexProperty(b => b.ActiveBidsTotal, moneyBuilder =>
        {
            moneyBuilder.Property(m => m.Amount)
                .HasColumnName("ActiveBidsTotalAmount")
                .HasColumnType("decimal(18, 4)")
                .IsRequired();

            moneyBuilder.Property(m => m.Currency)
                .HasColumnName("ActiveBidsTotalCurrency")
                .HasMaxLength(3)
                .HasConversion(c => c.Code, code => Currency.FromCode(code))
                .IsRequired();
        });

        builder.ComplexProperty(b => b.DefaultShippingAddress, addressBuilder =>
              {
                  addressBuilder.ConfigureAddressMapping();
              });
    }
}