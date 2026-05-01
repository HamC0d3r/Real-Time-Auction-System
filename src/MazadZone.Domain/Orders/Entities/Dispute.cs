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
        Resolution = null;
        CreatedAtUtc = DateTime.UtcNow; 
    }

    public OrderId OrderId { get; private init; }
    public Reason Reason { get; private set; }
    public Resolution? Resolution { get; private set; }
    public DisputeStatus Status { get; private set; }
    
    public DateTime CreatedAtUtc { get; private init; }
    public DateTime? ResolvedAtUtc { get; private set; }


    public bool IsResolved => Status == DisputeStatus.Resolved;
    internal static Result<Dispute> Create(OrderId orderId, string reason)
    {
        var reasonResult = Reason.Create(reason);
        if(reasonResult.IsFailure) return reasonResult.TopError;

        return new Dispute(
             DisputeId.New(), 
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

    public Result Resolve(string resolutionText)
    {
        if (Status == DisputeStatus.Resolved)
            return OrderErrors.DisputeAlreadyResolved;

        var resolutionResult = Resolution.Create(resolutionText);
        if (resolutionResult.IsFailure) return resolutionResult.TopError;

        Resolution = resolutionResult.Value;
        Status = DisputeStatus.Resolved;
        ResolvedAtUtc = DateTime.UtcNow; 
        
        return Result.Success();
    }
}