namespace MazadZone.Application.Features.Auctions.DTOs;

public sealed record SellerDto(
    Guid Id,
    string Name,
    string Email
);