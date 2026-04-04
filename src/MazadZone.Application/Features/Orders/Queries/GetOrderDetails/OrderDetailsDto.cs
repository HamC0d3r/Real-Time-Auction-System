using System;

namespace MazadZone.Application.Orders.Queries.DTOs;

public record OrderDetailsDto(
    Guid Id,
    Guid BidderId,
    Guid WinningBidId,
    decimal Amount,
    string Status,
    string DepositCaptureTransactionId,
    DateTime CreatedAt);