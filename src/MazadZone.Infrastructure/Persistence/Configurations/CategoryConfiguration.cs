using MazadZone.Domain.Categories;
using MazadZone.Domain.Shared;
using MazadZone.Infrastructure.Common.Constants;
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
            .HasConversion(
                id => id.Value,
                value => CategoryId.From(value));

        // Configure Name Value Object
        builder.OwnsOne(c => c.Name, nameBuilder =>
        {
            nameBuilder.Property(n => n.Value)
                .HasColumnName("Name")
                .HasMaxLength(SharedConstainst.MaxNameLength)
                .IsRequired();
        });

        // Configure Description Value Object
        builder.OwnsOne(c => c.Description, descBuilder =>
        {
            descBuilder.Property(d => d.Value)
                .HasColumnName("Description")
                .HasMaxLength(SharedConstainst.MaxDescriptionLength);
        });

        // --- Self-Referencing Relationship ---

        builder.HasOne<Category>()
            .WithMany(c => c.SubCategories)
            .HasForeignKey(c => c.ParentCategoryId)
            .OnDelete(DeleteBehavior.Restrict); 
            // Restrict prevents deleting a parent if children exist. 
            // Since you use Soft Delete, this is the safest approach.

        // --- Query Filters ---
        
        // Automatically hide soft-deleted categories from all queries
        builder.HasQueryFilter(c => !c.IsDeleted);

        // Access the private backing field for the HashSet
        builder.Metadata
            .FindNavigation(nameof(Category.SubCategories))!
            .SetPropertyAccessMode(PropertyAccessMode.Field);
    }
}