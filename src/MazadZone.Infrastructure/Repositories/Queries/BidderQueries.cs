using MazadZone.Application.Features.Bidders.DTOs;
using MazadZone.Application.Services;
using MazadZone.Domain.Bidders;

namespace MazadZone.Infrastructure.Repositories.Queries;

public class BidderQueries : IBidderQueries
{
    public Task<BidderProfileDto?> GetBidderProfile(BidderId bidderId, CancellationToken cancellationToken = default)
    {
        throw new NotImplementedException();
    }
}