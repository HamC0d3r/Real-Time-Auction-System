using MazadZone.Domain.Orders;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MazadZone.Infrastructure.Persistence.Extensions;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.ValueObjects;


namespace MazadZone.Infrastructure.Persistence.Configurations;

public class OrderConfiguration : IEntityTypeConfiguration<Order>
{
       public void Configure(EntityTypeBuilder<Order> builder)
       {
              builder.ToTable(TableNames.Orders);

              builder.HasKey(o => o.Id);

              builder.Property(o => o.Id)
                     .HasConversion(new OrderIdConverter())
                     .ValueGeneratedNever();

              builder.Property(o => o.BidderId)
                     .HasConversion(new BidderIdConverter())
                     .IsRequired();

              builder.Property(o => o.AuctionId)
                     .HasConversion(new AuctionIdConverter())
                     .IsRequired();

              builder.Property(o => o.WinningBidId)
                     .HasConversion(new BidIdConverter())
                     .IsRequired();

              builder.ComplexProperty(o => o.ReceiptAddress, addressBuilder =>
              {
                     addressBuilder.ConfigureAddressMapping();
              });

              builder.OwnsOne(o => o.TotalAmount, moneyBuilder =>
              {
                     moneyBuilder.Property(m => m.Amount)
                           .HasColumnName("TotalAmount")
                           .HasColumnType("decimal(18,4)")
                           .IsRequired();

                     moneyBuilder.Property(m => m.Currency)
        .HasColumnName("Currency")
        .HasMaxLength(OrderConstants.MaxCurrencyCodeLength)
        .HasConversion(
            currency => currency.Code, 
            code => Currency.FromCode(code)
        ) // 👈 REPLACED .HasConversion<string>()
        .IsRequired();
              });

              builder.Property(o => o.Status)
                     .HasConversion<int>()
                     .HasColumnType("int")
                     .IsRequired();

              builder.Property(o => o.CreatedOnUtc).IsRequired();
              builder.Property(o => o.ModifiedOnUtc).IsRequired(false);

              builder.HasOne(o => o.Dispute)
                     .WithOne()
                     .HasForeignKey<Dispute>(d => d.OrderId)
                     .IsRequired(false)
                     .OnDelete(DeleteBehavior.Cascade);



              builder.HasOne(o => o.Feedback)
                     .WithOne()
                     .HasForeignKey<Feedback>(fb => fb.OrderId)
                     .IsRequired(false)
                     .OnDelete(DeleteBehavior.Cascade);


              builder.Ignore(o => o.IsDisputable);
              builder.Ignore(o => o.CanLeaveFeedback);
              builder.Ignore(o => o.HasActiveDispute);
       }
}