using AuthService.Domain.Constants;
using MazadZone.Domain.Users;
using MazadZone.Domain.Users.ValueObjects;
using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Infrastructure.Persistence.Converters;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazadZone.Infrastructure.Database.Configurations;

public class UserConfiguration : IEntityTypeConfiguration<User>
{
    public void Configure(EntityTypeBuilder<User> builder)
    {
        // 1. Table Mapping
        builder.ToTable(TableNames.Users);
        
        builder.HasKey(u => u.Id);
        
        builder.Property(u => u.Id)
            .HasConversion(new UserIdIdConverter())
            .ValueGeneratedNever();

        // 2. Multi-Property Value Objects (Complex Types)
        builder.ComplexProperty(u => u.FullName, nameBuilder =>
        {
            nameBuilder.Property(f => f.FirstName)
                .HasColumnName("FirstName")
                .HasMaxLength(UserConstants.NameMaxLength)
                .IsRequired();

            nameBuilder.Property(f => f.SecondName)
                .HasColumnName("SecondName")
                .HasMaxLength(UserConstants.NameMaxLength)
                .IsRequired();

            nameBuilder.Property(f => f.ThirdName)
                .HasColumnName("ThirdName")
                .HasMaxLength(UserConstants.NameMaxLength)
                .IsRequired();

            nameBuilder.Property(f => f.LastName)
                .HasColumnName("LastName")
                .HasMaxLength(UserConstants.NameMaxLength)
                .IsRequired();
        });

        builder.ComplexProperty(u => u.PhoneNumber, phoneBuilder =>
        {
            phoneBuilder.Property(p => p.Value)

                .HasColumnName("PhoneNumber")
                .HasMaxLength(UserConstants.PhoneNumberLength);

            phoneBuilder.IsRequired(true);
        });


        builder.Property(u => u.Email)
            .HasConversion(
                email => email.Value,
                value => Email.Create(value).Value
            )
            .HasMaxLength(UserConstants.EmailMaxLength)
            .IsRequired()
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasIndex(u => u.Email)
            .IsUnique();

        builder.Property(u => u.PasswordHash)
            .HasConversion(
                passwordHash => passwordHash.Value,
                value => PasswordHash.Create(value).Value
            )
            .HasMaxLength(UserConstants.PasswordHashLength)
            .IsRequired()
            .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.Property(u => u.Status)
            .HasConversion<int>()
            .HasColumnType("int")
            .IsRequired();

        builder.Property(u => u.Roles)
            .HasConversion(new UserRolesBitmaskConverter())
            .HasColumnName("Roles")
            .HasColumnType("int")
           .IsRequired()
           .UsePropertyAccessMode(PropertyAccessMode.Field);

        builder.HasMany(u => u.HashedRefreshTokens)
            .WithOne()
            .HasForeignKey(rt => rt.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.Navigation(u => u.HashedRefreshTokens)
            .HasField("_hashedRefreshTokens")
            .UsePropertyAccessMode(PropertyAccessMode.Field);


    }
}