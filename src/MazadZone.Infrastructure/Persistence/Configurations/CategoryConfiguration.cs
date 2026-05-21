using MazadZone.Domain.Categories;
using MazadZone.Domain.Shared;
using MazadZone.Domain.Shared.ValueObjects;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazadZone.Infrastructure.Persistence.Configurations;

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable(TableNames.Categories);

        builder.HasKey(c => c.Id);

        builder.Property(c => c.Id)
            .HasConversion(new CategoryIdConverter());

        builder.Property(c => c.ParentCategoryId)
            .HasConversion(new CategoryIdConverter())
            .IsRequired(false);

        builder.Property(c => c.Name)
            .HasConversion(
                n => n.Value, // Write to DB
                value => Name.Create(value).Value) // Read from DB
            .HasColumnName("Name")
            .HasMaxLength(SharedConstainst.MaxNameLength)
            .IsRequired();

        builder.Property(c => c.Description)
            .HasConversion(
                d => d.Value, // Write to DB
                value => Description.Create(value).Value) // Read from DB
            .HasColumnName("Description")
            .HasMaxLength(SharedConstainst.MaxDescriptionLength);

        builder.HasOne<Category>()
            .WithMany(c => c.SubCategories)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict); 
        
        builder.HasQueryFilter(c => !c.IsDeleted);

        builder.Metadata
            .FindNavigation(nameof(Category.SubCategories))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);
    }
}