using MazadZone.Domain.Auctions;
using MazadZone.Domain.Shared;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MazadZone.Infrastructure.Persistence.Extensions;


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
        
        builder.Property(a => a.ItemId)
            .HasConversion(new ItemIdConverter())
            .IsRequired();
            
        builder.Property(a => a.SellerId)
            .HasConversion(new SellerIdConverter())
            .IsRequired();
        
        builder.HasOne(a => a.Item)
            .WithOne() 
            .HasForeignKey<Auction>(a => a.ItemId) 
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);
        
        
        builder.HasMany(a => a.Bids)
            .WithOne()
            .HasForeignKey("AuctionId") // Shadow FK in Bids table
            .IsRequired()
            .OnDelete(DeleteBehavior.Cascade);

        

        builder.ComplexProperty(a => a.StartBidAmount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("StartBidAmount");

            money.Property(m => m.Currency)
                .HasConversion<string>();
        });
        
        builder.ComplexProperty(a => a.MinBidAmount, money =>
        {
            money.Property(m => m.Amount)
                .HasColumnName("MinBidAmount");

            money.Property(m => m.Currency)
                .HasConversion<string>();
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

        builder.Property(a=> a.CancellationReason)
            .HasMaxLength(AuctionConstants.MaxCancellationReasonLength)
            .IsRequired(false);
        

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