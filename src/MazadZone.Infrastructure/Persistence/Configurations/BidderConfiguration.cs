using MazadZone.Domain.Auctions;
using MazadZone.Domain.Bidders;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MazadZone.Infrastructure.Persistence.Extensions;
using MazadZone.Domain.Users;
using MazadZone.Domain.Shared;
using MazadZone.Domain.Shared.Errors;

namespace MazadZone.Infrastructure.Persistence.Configurations;

internal sealed class BidderConfiguration : IEntityTypeConfiguration<Bidder>
{
    public void Configure(EntityTypeBuilder<Bidder> builder)
    {
        builder.ToTable(TableNames.Bidders);

        // Primary Key
        builder.HasKey(b => b.Id);

        builder.Property(b => b.Id)
               .HasConversion(new UserIdConverter()) // Ensure you have this converter
               .ValueGeneratedNever();

        // Primitives
        builder.Property(b => b.CreatedOnUtc).IsRequired();
        builder.Property(b => b.ModifiedOnUtc).IsRequired(false);
        builder.Property(b => b.CompletedPurchasesCount).HasDefaultValue(0);
        builder.Property(b => b.AuctionsWonCount).HasDefaultValue(0);
        builder.Property(b => b.TotalPidsPlaced).HasDefaultValue(0);
        builder.Property(b => b.AuctionParticipatedCount).HasDefaultValue(0);

        builder.Ignore(b => b.IsVerified);
        builder.Ignore(b => b.NationalId);

        builder.Ignore(b => b.UnpaidAuctions);

        builder.Property<HashSet<AuctionId>>("_unpaidAuctions")
               .HasColumnName("UnpaidAuctions")
               .HasColumnType("text")
               .HasConversion(new AuctionIdSetConverter())
               .Metadata.SetValueComparer(new AuctionIdSetComparer());

        builder.OwnsOne(b => b.Verification, verification =>
        {
            verification.ToTable(TableNames.BidderVerifications);

            verification.Property(v => v.NationalId)
                        .HasMaxLength(50)
                        .IsRequired();

            verification.HasIndex(v => v.NationalId)
                        .IsUnique();

            verification.Property(v => v.IsVerified)
                        .IsRequired();

            verification.Property(v => v.Status)
                        .HasConversion<int>()
                        .HasColumnType("int")
                        .IsRequired();

            verification.Property(v => v.ExtractedFullName)
                        .HasMaxLength(200)
                        .IsRequired(false);

            verification.Property(v => v.RejectionReason)
                        .HasMaxLength(500)
                        .IsRequired(false);
        });

        builder.OwnsMany(b => b.Addresses, addressBuilder =>
        {
            // 1. Define the separate table name
            addressBuilder.ToTable("BidderAddresses");

            // 2. Create a "Shadow Property" for the Primary Key 
            // (Because Value Objects don't have IDs in your domain model)
            addressBuilder.Property<int>("Id").ValueGeneratedOnAdd();
            addressBuilder.HasKey("Id");

            // 3. Define the Foreign Key back to the Bidder
            addressBuilder.WithOwner().HasForeignKey("BidderId");

            // 4. Map the Address properties (applying your domain constraints)
            addressBuilder.Property(a => a.City)
                .HasMaxLength(AddressErrors.MaxCityLength) // Assuming this is defined in your constants
                .IsRequired();

            addressBuilder.Property(a => a.Street)
                .HasMaxLength(SharedConstainst.MaxStreetLength)
                .IsRequired();

            addressBuilder.Property(a => a.Building)
                .HasMaxLength(SharedConstainst.MaxBuildingLength)
                .IsRequired();

            addressBuilder.Property(a => a.Landmark)
                .HasMaxLength(SharedConstainst.MaxLandmarkLength)
                .IsRequired();
        });

        // 5. Tell EF Core to read/write directly to the backing field
        builder.Metadata.FindNavigation(nameof(Bidder.Addresses))!
               .SetPropertyAccessMode(PropertyAccessMode.Field);

        builder.HasOne<User>()
            .WithOne()
            .HasForeignKey<Bidder>(b => b.Id)
            .IsRequired()
            .OnDelete(DeleteBehavior.Restrict);



    }
}
