namespace MazadZone.Domain.Entities.Users;

using MazadZone.Domain.Shared;
using MazadZone.Domain.Shared.Errors;

public  record Address
(
    string City,
    string Street,
    string Building,
    string Landmark
)
{
    public static Result<Address> Create( string city, string street, string building, string landmark)
    {
        if (string.IsNullOrWhiteSpace(city)) return AddressErrors.EmptyCity;
        if (city.Length > AddressErrors.MaxCityLength) return AddressErrors.CityTooLongError;


        if (string.IsNullOrWhiteSpace(street)) return AddressErrors.EmptyStreetError;
        if (street.Length > SharedConstainst.MaxStreetLength) return AddressErrors.StreetTooLongError;


        if (string.IsNullOrWhiteSpace(building)) return AddressErrors.EmptyBuildingError;
        if (building.Length > SharedConstainst.MaxBuildingLength) return AddressErrors.BuildingTooLongError;

        if (string.IsNullOrWhiteSpace(landmark)) return AddressErrors.EmptyLandmarkError;
        if (landmark.Length > SharedConstainst.MaxLandmarkLength) return AddressErrors.LandmarkTooLongError;

        return new Address(city, street, building, landmark);
    }

    
}