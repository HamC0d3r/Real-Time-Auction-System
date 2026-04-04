namespace MazadZone.Domain.Orders;

using MazadZone.Domain.Primitives;

public sealed class Dispute : Entity<DisputeId>
{
    private Dispute() { }

    private Dispute(DisputeId id, OrderId orderId, Reason reason) : base(id)
    {
        OrderId = orderId;
        Reason = reason;
        Status = DisputeStatus.Open; 
        CreatedAtUtc = DateTime.UtcNow; 
    }

    public OrderId OrderId { get; private init; }
    public Reason Reason { get; private set; }
    public DisputeStatus Status { get; private set; }
    
    public DateTime CreatedAtUtc { get; private init; }
    public DateTime? ResolvedAtUtc { get; private set; }

    internal static Result<Dispute> Create(OrderId orderId, string reason)
    {
        var reasonResult = Reason.Create(reason);
        if(reasonResult.IsFailure) return reasonResult.TopError;

        return new Dispute(
            new DisputeId(Guid.NewGuid()), 
            orderId, 
            reasonResult.Value);
    }


    public Result ChangeReason(Reason newReason)
    {
        if (Status == DisputeStatus.Resolved)
            return OrderErrors.DisputeCannotChangeReason;

        Reason = newReason;
        return Result.Success();
    }

    public Result Resolve()
    {
        if (Status == DisputeStatus.Resolved)
            return OrderErrors.DisputeAlreadyResolved;

        Status = DisputeStatus.Resolved;
        ResolvedAtUtc = DateTime.UtcNow; 
        
        return Result.Success();
    }
}