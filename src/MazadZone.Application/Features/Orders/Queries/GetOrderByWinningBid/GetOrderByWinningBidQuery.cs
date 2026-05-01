using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Domain.Auctions;

namespace MazadZone.Application.Features.Orders.Queries.GetOrderByWinningBid;

public record GetOrderByWinningBidQuery(BidId WinningBidId) : IQuery<OrderDetailsDto>;
