using MazadZone.Domain.Orders;
using MazadZone.Domain.Primitives;

namespace MazadZone.Domain.Financials;

public readonly record struct PaymentId(Guid Value);

public sealed class Payment : AggregateRoot<PaymentId>
{
    private Payment() { }

    private Payment(
        PaymentId id, OrderId orderId, UserId userId, PaymentType type, Money amount, string paymentIntentId) 
        : base(id)
    {
        OrderId = orderId;
        UserId = userId;
        Type = type;
        Amount = amount;
        PaymentIntentId = paymentIntentId;
        Status = PaymentStatus.Pending;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public OrderId OrderId { get; private init; }
    public UserId UserId { get; private init; }
    public PaymentType Type { get; private init; }
    public Money Amount { get; private init; }
    public string PaymentIntentId { get; private init; }
    public PaymentStatus Status { get; private set; }
    
    public DateTime CreatedAtUtc { get; private init; }
    public DateTime? CompletedAtUtc { get; private set; }
    public string? FailureReason { get; private set; }

    public static Payment Create(OrderId orderId, UserId userId, PaymentType type, Money amount, string paymentIntentId)
    {
        return new Payment(new PaymentId(Guid.NewGuid()), orderId, userId, type, amount, paymentIntentId);
    }

    public Result SetAsCompleted()
    {
        if (Status != PaymentStatus.Pending)
            return Result.Failure(new Error("Payment.InvalidState", "Only pending payments can be completed."));

        Status = PaymentStatus.Completed;
        CompletedAtUtc = DateTime.UtcNow;

        // RaiseDomainEvent(new PaymentCompletedDomainEvent(this.Id, this.OrderId));
        return Result.Success();
    }

    public Result SetAsFailed(string reason)
    {
        if (Status != PaymentStatus.Pending)
            return Result.Failure(new Error("Payment.InvalidState", "Only pending payments can be marked as failed."));

        Status = PaymentStatus.Failed;
        FailureReason = reason;

        // RaiseDomainEvent(new PaymentFailedDomainEvent(this.Id, this.OrderId));
        return Result.Success();
    }
}