using MazadZone.Domain.Auctions;

namespace MazadZone.Domain.Financials;

public sealed class Transaction : AggregateRoot<TransactionId>
{
    #pragma warning disable CS8618 
    #pragma warning disable CS0519
    private Transaction() { }
    #pragma warning restore CS8618


    private Transaction(
        TransactionId id, OrderId orderId, SellerId sellerId, TransactionType type, Money amount, string gatewayReferenceId) 
        : base(id)
    {
        OrderId = orderId;
        SellerId = sellerId;
        Type = type;
        Amount = amount;
        GatewayReferenceId = gatewayReferenceId;
        Status = TransactionStatus.Pending;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public OrderId OrderId { get; private init; }
    public SellerId SellerId { get; private init; }
    public TransactionType Type { get; private init; }
    public Money Amount { get; private init; }
    public string GatewayReferenceId { get; private init; }
    public TransactionStatus Status { get; private set; }
    
    public DateTime CreatedAtUtc { get; private init; }
    public DateTime? ProcessedAtUtc { get; private set; }
    public string? FailureReason { get; private set; }

    public static Transaction Create(OrderId orderId, SellerId sellerId, TransactionType type, Money amount, string gatewayReferenceId)
    {
        return new Transaction(TransactionId.New(), orderId, sellerId, type, amount, gatewayReferenceId);
    }

    public Result SetAsSucceeded()
    {
        if (Status != TransactionStatus.Pending)
            return Result.Failure( Error.Conflict("Transaction.InvalidState", "Only pending transactions can succeed."));

        Status = TransactionStatus.Succeeded;
        ProcessedAtUtc = DateTime.UtcNow;

        return Result.Success();
    }

    public Result SetAsFailed(string reason)
    {
        if (Status != TransactionStatus.Pending)
            return Result.Failure( Error.Conflict("Transaction.InvalidState", "Only pending transactions can fail."));

        Status = TransactionStatus.Failed;
        FailureReason = reason;

        return Result.Success();
    }
}