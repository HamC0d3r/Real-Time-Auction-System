namespace MazadZone.Domain.Shared.Errors;


public static class AddressErrorCodes
{
    public const string EmptyCity = "Address.EmptyCity";
    public const string EmptyStreet = "Address.EmptyStreet.";
    public const string CityTooLong = "Address.CityTooLong";
    public const string StreetTooLong = "Address.StreetTooLong";
    public const string BuildingTooLong = "Address.BuildingTooLong";
    public const string LandmarkTooLong = "Address.LandmarkTooLong";
    public const string EmptyBuilding = "Address.EmptyBuilding";
    public const string EmptyLandmark = "Address.EmptyLandmark";

}
public static class AddressErrors
{
    public const int MaxCityLength = 100;
    public const int MaxStreetLength = 200;
    public const int MaxBuildingLength = 50;
    public const int MaxLandmarkLength = 100;

    public static readonly Error EmptyCity = Error.Validation(
        AddressErrorCodes.EmptyCity,
        "The city cannot be empty or whitespace.");

    public static readonly Error EmptyStreetError = Error.Validation(
        AddressErrorCodes.EmptyStreet,
        "The street cannot be empty or whitespace.");

    public static readonly Error CityTooLongError = Error.Validation(
        AddressErrorCodes.CityTooLong,
        $"The city cannot exceed {MaxCityLength} characters.");

    public static readonly Error StreetTooLongError = Error.Validation(
        AddressErrorCodes.StreetTooLong,
        $"The street cannot exceed {MaxStreetLength} characters.");

    public static readonly Error BuildingTooLongError = Error.Validation(
        AddressErrorCodes.BuildingTooLong,
        $"The building cannot exceed {MaxBuildingLength} characters.");

    public static readonly Error LandmarkTooLongError = Error.Validation(
        AddressErrorCodes.LandmarkTooLong,
        $"The landmark cannot exceed {MaxLandmarkLength} characters.");

    public static readonly Error EmptyBuildingError = Error.Validation(
        AddressErrorCodes.EmptyBuilding,
        "The building cannot be empty or whitespace.");

    public static readonly Error EmptyLandmarkError = Error.Validation(
        AddressErrorCodes.EmptyLandmark,
        "The landmark cannot be empty or whitespace.");
}
