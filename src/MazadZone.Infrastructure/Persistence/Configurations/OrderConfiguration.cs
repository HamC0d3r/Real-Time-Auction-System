using MazadZone.Domain.Orders;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MazadZone.Infrastructure.Persistence.Extensions;


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
                           .HasConversion<string>()
                           .IsRequired();
              });

              builder.Property(o => o.Status)
                     .HasConversion<int>()
                     .IsRequired();

              builder.Property(o => o.DepositCaptureTransactionId)
                     .HasMaxLength(OrderConstants.MaxTransactionIdLength)
                     .IsRequired(); 

              builder.Property(o => o.RemainingBalanceTransactionId)
                     .HasMaxLength(OrderConstants.MaxTransactionIdLength)
                     .IsRequired(false);

              builder.HasOne(o => o.Dispute)
                     .WithOne()
                     .HasForeignKey<Order>(o => o.DisputeId)
                     .IsRequired(false);

              builder.HasOne(o => o.Feedback)
                     .WithOne()
                     .HasForeignKey<Order>(o => o.FeedbackId)
                     .IsRequired(false);

              builder.Ignore(o => o.IsDisputable);
              builder.Ignore(o => o.CanLeaveFeedback);
              builder.Ignore(o => o.HasActiveDispute);


              //Auction Table ItemId
              //Item Id


              //  // Assuming OrderStatus.Active/Pending/Confirmed map to 1 or specific integers
              //  builder.HasIndex(o => o.Status)
              //         .HasDatabaseName("IX_Orders_ActiveStatus")
              //         .HasFilter("[Status] = 1"); // Filtered Index for active orders

              //  // Covering Index for fast dashboard retrieval
              //  builder.HasIndex(o => new { o.Status, o.CreatedOnUtc })
              //         .IncludeProperties(o => new { o.TotalAmount }) // SQL Server specific feature
              //         .HasDatabaseName("IX_Orders_Active_Covering")
              //         .HasFilter("[Status] = 1");
       }
}

#region Sample Data for Dashboard Queries ("DailyOrderStats")
// Date,OrderStatus,TotalAmount,OrderCount

// 2026-04-27,Delivered,"$15,400.00",42

// 2026-04-27,Confirmed,"$8,200.00",15

// 2026-04-28,Delivered,"$12,100.00",38
#endregion