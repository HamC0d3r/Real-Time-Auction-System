using MazadZone.Domain.Auctions;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MazadZone.Infrastructure.Persistence.Extensions;
using MazadZone.Domain.Shared.ValueObjects;
using MazadZone.Domain.Shared;
using MazadZone.Domain.ValueObjects;


namespace MazadZone.Infrastructure.Persistence.Configurations;

class AuctionsConfiguration : IEntityTypeConfiguration<Auction>
{
    public void Configure(EntityTypeBuilder<Auction> builder)
    {
        builder.ToTable(TableNames.Auctions);

        builder.HasKey(a => a.Id);

        builder.Property(a => a.Id)
            .HasConversion( new AuctionIdConverter() )
            .ValueGeneratedNever();
        
            
        builder.Property(a => a.SellerId)
            .HasConversion(new SellerIdConverter())
            .IsRequired();
        
        builder.HasOne(a => a.Item)
            .WithOne() 
            .HasForeignKey<Item>(i => i.AuctionId) 
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
        
        
        builder.HasMany(a => a.Bids)
            .WithOne()
            .HasForeignKey(b => b.AuctionId) 
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        

        builder.ComplexProperty(a => a.StartBidAmount, moneyBuilder =>
{
    moneyBuilder.Property(m => m.Amount)
        .HasColumnName("StartBidAmount")
        .HasColumnType("decimal(18, 4)")
        .IsRequired();

    moneyBuilder.Property(m => m.Currency)
        .HasColumnName("StartBidCurrency")
        .HasMaxLength(3) // Assuming 3-letter currency code (e.g., JOD)
        .HasConversion(
            currency => currency.Code, // Convert to string for DB (or .HasConversion<string>() if it's an enum)
            code => Currency.FromCode(code) // Convert back to Currency object (adjust to match your Currency class logic)
        )
        .IsRequired();
});

// 2. Configure MinBidAmount
builder.ComplexProperty(a => a.MinBidAmount, moneyBuilder =>
{
    moneyBuilder.Property(m => m.Amount)
        .HasColumnName("MinBidAmount")
        .HasColumnType("decimal(18, 4)")
        .IsRequired();

    moneyBuilder.Property(m => m.Currency)
        .HasColumnName("MinBidCurrency")
        .HasMaxLength(3)
        .HasConversion(
            currency => currency.Code, 
            code => Currency.FromCode(code)
        )
        .IsRequired();
});

        builder.Property(a => a.StartTime)
            .IsRequired();
        
        builder.Property(a => a.EndTime)
            .IsRequired();
        
        builder.Property(a => a.Status)
            .HasConversion<int>()
            .IsRequired();
        
        builder.Property(a => a.CreatedOnUtc)
            .IsRequired();
        
        builder.Property(a => a.ModifiedOnUtc)
            .IsRequired(false);

        builder.Property(a => a.CancellationReason)
       .HasConversion(
           // 1. Convert to string when saving to the database
           reason => reason.Text, // (Or reason.Text, depending on your Reason class property)
           
           // 2. Convert back to Reason object when reading from the database
           value => Reason.Create(value).Value
       )
       .HasColumnName("CancellationReason")
       .HasMaxLength(SharedConstainst.MaxReasonLength) // Set this to whatever max length your Reason validates against
       .IsRequired(false); // Explicitly mark it as nullable in the DB
        

        builder.ComplexProperty(a => a.ShippingAddress, addressBuilder =>
        {
            addressBuilder.ConfigureAddressMapping();
        });


        builder.Ignore(a => a.CurrentLeadingBid);
        builder.Ignore(a => a.CurrentHighestBidAmount);
        builder.Ignore(a => a.MinNextBidAmount);
        builder.Ignore(a => a.TotalBids);
        builder.Ignore(a => a.HasBids);

    }


}