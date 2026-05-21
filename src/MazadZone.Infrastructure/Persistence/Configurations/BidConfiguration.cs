using MazadZone.Domain.Auctions;
using MazadZone.Domain.ValueObjects;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazadZone.Infrastructure.Persistence.Configurations;

class BidConfiguration : IEntityTypeConfiguration<Bid>
{
    public void Configure(EntityTypeBuilder<Bid> builder)
    {
        builder.ToTable(TableNames.Bids);
        builder.HasKey(b => b.Id);

        builder.Property(b => b.Id)
            .HasConversion(new BidIdConverter())
            .ValueGeneratedNever();

        builder.Property(b => b.BidderId)
            .HasConversion(new BidderIdConverter())
            .IsRequired();

        
        builder.Property(b => b.PlacedAtUtc).IsRequired();
        builder.Property(b => b.Status).HasConversion<int>().IsRequired();
        builder.Property(b => b.GatewayAuthHoldId).IsRequired();

        builder.ComplexProperty(b => b.Amount, moneyBuilder => 
{
    moneyBuilder.Property(m => m.Amount)
        .HasColumnName("Amount")
        .HasColumnType("decimal(18,4)")
        .IsRequired();

    moneyBuilder.Property(m => m.Currency)
        .HasColumnName("AmountCurrency")
        .HasMaxLength(AuctionConstants.MaxCurrencyCodeLength)
        // 👇 USE THIS IF Currency IS A CLASS/RECORD:
        .HasConversion(
            currency => currency.Code, // Convert to string (adjust .Code to match your property name)
            code => Currency.FromCode(code) // Convert back to object (adjust method to match yours)
        )
        // 👇 OR USE THIS ONLY IF Currency IS A STANDARD ENUM:
        // .HasConversion<string>() 
        .IsRequired();
});

builder.ComplexProperty(b => b.DepositAmount, moneyBuilder => 
{
    moneyBuilder.Property(m => m.Amount)
        .HasColumnName("DepositAmount")
        .HasColumnType("decimal(18,4)")
        .IsRequired();

    moneyBuilder.Property(m => m.Currency)
        .HasColumnName("DepositAmountCurrency")
        .HasMaxLength(AuctionConstants.MaxCurrencyCodeLength)
        .HasConversion(
            currency => currency.Code, 
            code => Currency.FromCode(code)
        )
        .IsRequired();
});
        

    }
}