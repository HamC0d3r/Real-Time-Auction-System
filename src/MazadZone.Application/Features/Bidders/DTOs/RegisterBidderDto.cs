using MazadZone.Application.Features.Authentication.DTOs;

namespace MazadZone.Application.Features.Bidders.DTOs;

public record RegisterBidderDto(BidderProfileDto ProfileInfo, TokenDto TokenInfo);
