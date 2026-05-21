using MazadZone.Application.Features.Bidders.DTOs;
using MazadZone.Domain.Bidders;
using MazadZone.Domain.Shared.Interfaces;

namespace MazadZone.Application.Services;
public interface IBidderQueries : IScopedService
{
    Task<BidderProfileDto?> GetBidderProfile(BidderId bidderId, CancellationToken cancellationToken = default);
}