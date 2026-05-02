
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Items;
using MazadZone.Domain.Sellers;
using MazadZone.Domain.Shared.ValueObjects;
using MazadZone.Domain.Users;
using MazadZone.Domain.ValueObjects;

namespace MazadZone.Application.Features.Auctions.Commands.CreateAuction;

public sealed record CreateAuctionCommand(
    ItemId ItemId,
    SellerId SellerId,
    Address ShippingAddress,
    decimal StartBid,
    decimal MinBidAmount,
    Currency Currency,
    DateTime StartTime,
    DateTime EndTime) : ICommand<AuctionId>;
