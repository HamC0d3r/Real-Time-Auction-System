using MazadZone.Domain.Auctions;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazadZone.Infrastructure.Persistence.Configurations;

class ItemConfiguration : IEntityTypeConfiguration<Item>
{
    public void Configure(EntityTypeBuilder<Item> builder)
    {
        builder.ToTable(TableNames.Items);
        builder.HasKey(i => i.Id);

        builder.Property(i => i.Id)
            .HasConversion(new ItemIdConverter())
            .ValueGeneratedNever();
        
        builder.Property(i => i.CategoryId)
            .HasConversion(new CategoryIdConverter())
            .IsRequired();        

        builder.Property(i => i.Title)
            .HasMaxLength(AuctionConstants.MaxTitleLength)
            .IsRequired();

        builder.Property(i => i.Description)
            .HasMaxLength(AuctionConstants.MaxDescriptionLength)
            .IsRequired(false);

    builder.OwnsMany(i => i.Images, imageBuilder =>
    {
        imageBuilder.ToTable("Images");

        imageBuilder.WithOwner().HasForeignKey("ItemId");

        imageBuilder.Property<int>("Id")
            .ValueGeneratedOnAdd();
            
        imageBuilder.HasKey("Id");

        imageBuilder.Property(img => img.Path) 
            .HasColumnName("ImageUrl")
            .HasMaxLength(2048)
            .IsRequired();

        imageBuilder.Property(img => img.AltText)
            .HasMaxLength(255)
            .IsRequired(false);

        imageBuilder.Property(img => img.isMain)
            .IsRequired();
    });
        
    }
}