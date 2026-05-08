using MazadZone.Application.Features.Bidders.DTOs;

namespace MazadZone.Application.Features.Bidders.Commands.Register;
public record RegisterBidderCommand(
    string Email,
    string Password,
    string PhoneNumber,
    string NationalId,
    string FirstName,
    string SecondName,
    string ThirdName,
    string LastName,
    AddressDto Address
    
) : ICommand<RegisterBidderDto>;
