namespace MazadZone.Domain.Orders;

using MazadZone.Domain.Primitives;
using MazadZone.Domain.Shared.ValueObjects;

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


    internal Result ChangeReason(Reason newReason)
    {
        if (Status == DisputeStatus.Resolved)
            return OrderErrors.DisputeCannotChangeReason;

        Reason = newReason;
        return Result.Success();
    }

    internal Result Resolve(string resolutionText)
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

// public enum DisputeVerdict
// {
//     None = 0,             // Still under investigation
//     RefundBidder = 1,     // The seller was at fault; return money to the buyer
//     PaySeller = 2,        // The bidder's claim was invalid; give money to the seller
//     PartialRefund = 3,    // A compromise where both parties get some money
//     EscalateToLegal = 4   // Too complex for the system; requires manual legal intervention
// }