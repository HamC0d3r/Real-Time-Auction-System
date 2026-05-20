using MazadZone.Application.Features.Auctions.DTOs;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Auctions.ValueObjects;
using MazadZone.Domain.Categories;
using MazadZone.Domain.Sellers;
using MazadZone.Domain.Shared.ValueObjects;
using MazadZone.Domain.ValueObjects;

namespace MazadZone.Application.Features.Auctions.Commands.CreateAuction;

public sealed record CreateAuctionCommand(
    ItemId ItemId,
    SellerId SellerId,
    Address ShippingAddress,
    decimal StartBidAmount,
    decimal MinBidAmount,
    Currency Currency,
    DateTime StartTime,
    DateTime EndTime,
    string Title,
    string Description,
    List<ImageModelDto> Images,
    CategoryId CatigoryId
    ) : ICommand<AuctionId>;
