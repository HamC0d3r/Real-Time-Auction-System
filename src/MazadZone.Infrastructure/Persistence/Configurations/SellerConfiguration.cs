using MazadZone.Domain.Sellers;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazadZone.Infrastructure.Persistence.Configurations;

internal sealed class SellerConfiguration : IEntityTypeConfiguration<Seller>
{
    public void Configure(EntityTypeBuilder<Seller> builder)
    {
        builder.ToTable(TableNames.Sellers);

        // Primary Key
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id)
               .HasConversion(new SellerIdConverter()) // Ensure you have this converter
               .ValueGeneratedNever();

        // Primitives
        builder.Property(s => s.BankAccountNumber).HasMaxLength(100).IsRequired();
        builder.Property(s => s.NationalId).HasMaxLength(50).IsRequired();
        builder.Property(s => s.TaxIdentificationNumber).HasMaxLength(50).IsRequired(false); // Nullable
        
        builder.Property(s => s.Rating)
               .HasColumnType("decimal(3, 2)") // E.g., 4.95
               .IsRequired();
               
        builder.Property(s => s.ReviewsCount).IsRequired();
        builder.Property(s => s.IsVerified).IsRequired();

        // Auditable Properties
        builder.Property(s => s.CreatedOnUtc).IsRequired();
        builder.Property(s => s.ModifiedOnUtc).IsRequired(false);
    }
}