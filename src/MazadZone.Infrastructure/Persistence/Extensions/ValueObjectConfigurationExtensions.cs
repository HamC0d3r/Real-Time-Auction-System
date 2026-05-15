namespace MazadZone.Infrastructure.Persistence.Extensions;

using Microsoft.EntityFrameworkCore.Metadata.Builders;
using MazadZone.Domain.Shared;
using MazadZone.Domain.Shared.ValueObjects;

public static class ValueObjectConfigurationExtensions
{
    public static ComplexPropertyBuilder<Address> ConfigureAddressMapping(
        this ComplexPropertyBuilder<Address> builder)
    {
        
        builder.Property(a => a.Street)
            .IsRequired()
            .HasMaxLength(SharedConstainst.MaxStreetLength);

        builder.Property(a => a.City)
            .IsRequired()
            .HasMaxLength(SharedConstainst.MaxCityLength);

        builder.Property(a => a.Building)
            .IsRequired()
            .HasMaxLength(SharedConstainst.MaxBuildingLength);

        builder.Property(a => a.Landmark)
            .IsRequired()
            .HasMaxLength(SharedConstainst.MaxLandmarkLength);


        return builder;
    }
}