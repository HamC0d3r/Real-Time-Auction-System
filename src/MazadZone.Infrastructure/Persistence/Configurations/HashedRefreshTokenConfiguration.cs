using MazadZone.Domain.Users;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazadZone.Infrastructure.Persistence.Configurations; 

public class HashedRefreshTokenConfiguration : IEntityTypeConfiguration<HashedRefreshToken>
{
    public void Configure(EntityTypeBuilder<HashedRefreshToken> builder)
    {
        // Table name
        builder.ToTable(TableNames.HashedRefreshTokens);

        builder.HasKey(rt => rt.Id);

        builder.Property(rt => rt.Id)
            .HasConversion(new HashedRefreshTokenIdConverter())
            .ValueGeneratedNever();

        builder.HasIndex(rt => rt.Token)
            .IsUnique()
            .HasDatabaseName("IX_Token_Unique");

        builder.Property(rt => rt.Token)
            .IsRequired();

        builder.Property(rt => rt.UserId)
            .HasConversion(new UserIdIdConverter()) 
            .IsRequired();

        builder.Property(rt => rt.ExpiresAt)
            .IsRequired();

        builder.Property(rt => rt.CreatedAt)
            .IsRequired()
            .HasDefaultValueSql("GETUTCDATE()"); 

        builder.Property(rt => rt.RevokedAt)
            .IsRequired(false);

        builder.Ignore(rt => rt.IsRevoked);
        builder.Ignore(rt => rt.IsActive);
        builder.Ignore(rt => rt.IsExpired);
    }
}