using System;
using MazadZone.Domain.Auctions;

namespace MazadZone.Api.Contracts.Orders;

public record CreateOrderRequest(
    BidderId BidderId,
    BidId WinningBidId,
    AddressId ReceiptAddressId,
    decimal Amount,
    string DepositCaptureTransactionId);