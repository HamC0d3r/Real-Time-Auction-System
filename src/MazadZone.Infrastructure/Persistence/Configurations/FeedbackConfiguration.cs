namespace MazadZone.Infrastructure.Persistence.Configurations;

using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MazadZone.Domain.Orders;
using MazadZone.Infrastructure.Persistence.Converters;
using MazadZone.Infrastructure.Common.Constants;

public sealed class FeedbackConfiguration : IEntityTypeConfiguration<Feedback>
{
    public void Configure(EntityTypeBuilder<Feedback> builder)
    {
        builder.ToTable(TableNames.Feedbacks);

        builder.HasKey(f => f.Id);

        builder.Property(f => f.Id)
            .HasConversion(new FeedbackIdConverter());


        builder.Property(f => f.OrderId)
            .IsRequired()
            .HasConversion(new OrderIdConverter());

        builder.Property(f => f.Rating)
            .IsRequired()
            .HasColumnName("Rating") 
            .HasConversion(
                rating => rating.Value, 
                value => Rating.Create(value).Value); 

        builder.Property(f => f.Comment)
            .IsRequired()
            .HasMaxLength(OrderConstants.MaxCommentLength) 
            .HasColumnName("Comment")
            .HasConversion(
                comment => comment.Value, 
                value => Comment.Create(value).Value); 

        builder.Property(f => f.Reply)
            .IsRequired() 
            .HasMaxLength(OrderConstants.MaxCommentLength)
            .HasColumnName("Reply")
             .HasConversion(
                comment => comment.Value, 
                value => Comment.Create(value).Value); 

        builder.Property(f => f.CreatedAtUtc)
            .IsRequired();

        builder.Property(f => f.RepliedAtUtc)
            .IsRequired(false);
            
    }
}