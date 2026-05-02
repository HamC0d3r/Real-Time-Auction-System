using System;
using MazadZone.Domain.Payments.ValueObjects;

namespace MzadZone.Domain.Payments.Entities;

public readonly record struct TransactionId(Guid Value);

public sealed class Transaction : Entity<TransactionId>
{
    // EF Core constructor
#pragma warning disable CS8618
    private Transaction() { }
#pragma warning restore CS8618

    // Internal constructor enforces that only the Payment root can instantiate this
    internal Transaction(
        TransactionId id, 
        PaymentId paymentId, 
        string gatewayIntentId, 
        TransactionType type) 
        : base(id)
    {
        PaymentId = paymentId;
        GatewayIntentId = gatewayIntentId;
        Type = type;
        Status = TransactionStatus.Pending;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public PaymentId PaymentId { get; private init; }
    public string GatewayIntentId { get; private init; }
    public TransactionType Type { get; private init; }
    public TransactionStatus Status { get; private set; }
    public string? FailureReason { get; private set; }
    public DateTime CreatedAtUtc { get; private init; }
    public DateTime? ProcessedAtUtc { get; private set; }

    internal void MarkAsSuccess()
    {
        if (Status != TransactionStatus.Pending)
            throw new InvalidOperationException($"Cannot mark transaction {Id.Value} as success because it is already {Status}.");

        Status = TransactionStatus.Success;
        ProcessedAtUtc = DateTime.UtcNow;
    }

    internal void MarkAsFailed(string reason)
    {
        if (Status != TransactionStatus.Pending)
            throw new InvalidOperationException($"Cannot mark transaction {Id.Value} as failed because it is already {Status}.");

        Status = TransactionStatus.Failed;
        FailureReason = reason;
        ProcessedAtUtc = DateTime.UtcNow;
    }
}