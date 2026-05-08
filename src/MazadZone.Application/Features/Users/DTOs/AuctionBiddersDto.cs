namespace MazadZone.Application.Features.Users.DTOs;

public record AuctionBiddersDto(
    Guid AuctionId, 
    string Title, 
    List<Guid> Bidders);