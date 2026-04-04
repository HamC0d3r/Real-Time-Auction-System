using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;

namespace MazadZone.Application.Features.Orders.Commands.CreateOrder;

public record CreateOrderCommand(
    BidderId BidderId,
    BidId WinningBidId,
    AddressId ReceiptAddressId,
    decimal Amount,
    string DepositCaptureTransactionId) : ICommand<OrderId>;