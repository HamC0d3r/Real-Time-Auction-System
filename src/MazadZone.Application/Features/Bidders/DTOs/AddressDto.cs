
namespace MazadZone.Application.Features.Bidders.DTOs;

public record AddressDto
(
    string City,
    string Street,
    string Building,
    string Landmark
)
{
    public Address ToAddress()
    {
        return new Address(City, Street, Building, Landmark);
    }

    public static AddressDto FromAddress(Address address)
    {
        return new AddressDto(address.City, address.Street, address.Building, address.Landmark);
    }
}
