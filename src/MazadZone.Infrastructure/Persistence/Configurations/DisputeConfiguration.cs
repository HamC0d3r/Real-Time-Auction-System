namespace MazadZone.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MazadZone.Domain.Orders;
using MazadZone.Infrastructure.Persistence.Converters;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Domain.Shared;

public sealed class DisputeConfiguration : IEntityTypeConfiguration<Dispute>
{
    public void Configure(EntityTypeBuilder<Dispute> builder)
    {
        builder.ToTable(TableNames.Disputes);

        builder.HasKey(d => d.Id);

        builder.Property(d => d.Id)
            .HasConversion(new DisputeIdConverter());


        builder.Property(d => d.OrderId)
            .IsRequired()
            .HasConversion(new OrderIdConverter());

        builder.Property(d => d.Reason)
            .IsRequired()
            .HasColumnName("Reason") 
            .HasMaxLength(SharedConstainst.MaxReasonLength)       
            .HasConversion(
                reason => reason.Text,
                value => Reason.Create(value).Value); 

        builder.Property(d => d.Resolution)
            .IsRequired(false) 
            .HasColumnName("Resolution")
            .HasMaxLength(OrderConstants.MaxResolutionLength) 
            .HasConversion(
                resolution => resolution == null ? null : resolution.Value,
                value => value == null ? null : Resolution.Create(value).Value); 

        builder.Property(d => d.Status)
            .IsRequired(); 

        builder.Property(d => d.CreatedAtUtc)
            .IsRequired();

        builder.Property(d => d.ResolvedAtUtc)
            .IsRequired(false);

        builder.Ignore(d => d.IsResolved);
    }
}