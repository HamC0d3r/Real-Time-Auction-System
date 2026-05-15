using MazadZone.Domain.Entities.Users;

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
}
