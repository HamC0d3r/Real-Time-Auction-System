using MazadZone.Application.Features.Bidders.DTOs;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Shared.ValueObjects;

namespace MazadZone.Application.Features.Orders.Commands.Create;

public record CreateOrderCommand(
    AuctionId AuctionId,
    BidderId BidderId,
    BidId WinningBidId,
    AddressDto ReceiptAddress,
    decimal Amount,
    string DepositCaptureTransactionId) : ICommand<OrderId>;