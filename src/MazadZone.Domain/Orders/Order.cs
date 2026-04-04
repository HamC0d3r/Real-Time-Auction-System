using MazadZone.Domain.Auctions;
using MazadZone.Domain.ValueObjects;

namespace MazadZone.Domain.Orders;


/// <summary>
/// Represents the Order Aggregate Root, managing the lifecycle of a post-auction transaction 
/// between a bidder and a seller, including shipping, feedback, and disputes.
/// </summary>
public sealed class Order : AggregateRoot<OrderId>
{
    private Order() { }

    private Order(
        OrderId id,
        BidderId bidderId,
        BidId winningBidId,
        AddressId receiptAddressId,
        Money totalAmount,
        string depositCaptureTransactionId) : base(id)
    {
        BidderId = bidderId;
        WinningBidId = winningBidId;
        ReceiptAddressId = receiptAddressId;
        TotalAmount = totalAmount;
        DepositCaptureTransactionId = depositCaptureTransactionId;
        Status = OrderStatus.Pending;
    }

    // --- Properties ---

    /// <summary>Gets the unique identifier of the bidder who placed the winning bid.</summary>
    public BidderId BidderId { get; private init; }

    /// <summary>Gets the unique identifier of the winning bid associated with this order.</summary>
    public BidId WinningBidId { get; private init; }

    /// <summary>Gets the delivery address identifier for the order.</summary>
    public AddressId ReceiptAddressId { get; private set; }

    /// <summary>Gets the current status in the order's state machine.</summary>
    public OrderStatus Status { get; private set; }

    /// <summary>Gets the total monetary amount of the order.</summary>
    public Money TotalAmount { get; private init; }

    /// <summary>Gets the transaction ID for the captured security deposit.</summary>
    public string DepositCaptureTransactionId { get; private init; }

    /// <summary>Gets the transaction ID for the remaining balance payment, if applicable.</summary>
    public string? RemainingBalanceTransactionId { get; private set; }

    /// <summary>Gets the unique identifier of the dispute if one has been opened.</summary>
    public DisputeId? DisputeId { get; private set; }

    /// <summary>Gets the dispute entity associated with this order.</summary>
    public Dispute? Dispute { get; private set; }

    /// <summary>Gets the unique identifier of the feedback left for this order.</summary>
    public FeedbackId? FeedbackId { get; private set; }

    /// <summary>Gets the feedback entity associated with this order.</summary>
    public Feedback? Feedback { get; private set; }

    // --- Static Factory Method ---

    /// <summary>
    /// Creates a new Order instance with a Pending status.
    /// </summary>
    /// <param name="bidderId">The ID of the winning bidder.</param>
    /// <param name="winningBidId">The ID of the bid that triggered the order.</param>
    /// <param name="receiptAddressId">The shipping destination.</param>
    /// <param name="totalAmount">The total price to be paid.</param>
    /// <param name="depositCaptureTransactionId">The financial reference for the deposit.</param>
    /// <returns>A newly initialized <see cref="Order"/>.</returns>
    public static Result<Order> Create(
        BidderId bidderId,
        BidId winningBidId,
        AddressId receiptAddressId,
        decimal totalAmount,
        string depositCaptureTransactionId)
    {
        var totalAmountResult = Money.Create(totalAmount, Currency.Jod);
        if (totalAmountResult.IsFailure) return OrderErrors.TotalAmountTooLow;

        var order = new Order(
            new OrderId(Guid.NewGuid()),
            bidderId,
            winningBidId,
            receiptAddressId,
            totalAmountResult.Value,
            depositCaptureTransactionId);

        return order;
    }

    // --- Operations (State Machine & Behaviors) ---

    /// <summary>Transitions the order status to Shipped.</summary>
    /// <returns>A success result or a failure if the order is not in a Confirmed state.</returns>
    public Result SetAsShipped()
    {
        if (Status != OrderStatus.Confirmed) return OrderErrors.CannotShipped;
        Status = OrderStatus.Shipped;
        return Result.Success();
    }

    /// <summary>Transitions the order status to Confirmed (payment verified).</summary>
    /// <returns>A success result or a failure if the order is not currently Pending.</returns>
    public Result SetAsConfirmed()
    {
        if (Status != OrderStatus.Pending) return OrderErrors.CannotConfirm;
        Status = OrderStatus.Confirmed;
        return Result.Success();
    }

    /// <summary>Transitions the order status to Delivered.</summary>
    /// <returns>A success result or a failure if the order was not previously Shipped.</returns>
    public Result SetAsDelivered()
    {
        if (Status != OrderStatus.Shipped) return OrderErrors.CannotDeliver;
        Status = OrderStatus.Delivered;
        return Result.Success();
    }

    /// <summary>Transitions the order status to Cancelled.</summary>
    /// <returns>A success result or a failure if the order has already moved past the Pending state.</returns>
    public Result SetAsCancelled()
    {
        if (Status != OrderStatus.Pending) return OrderErrors.CannotCancel;
        Status = OrderStatus.Cancelled;
        return Result.Success();
    }

    // --- Child Entity Management ---

    /// <summary>
    /// Attaches feedback to the order. This can only be done once the order is Delivered.
    /// </summary>
    /// <param name="ratingValue">Numerical rating (usually 1-5).</param>
    /// <param name="comment">The text content of the feedback.</param>
    /// <returns>A result indicating success or the specific validation error.</returns>
    public Result AddFeedback(int ratingValue, string comment)
    {
        if (FeedbackId is not null) return OrderErrors.FeedbackAlreadyExists;
        if (Status != OrderStatus.Delivered) return OrderErrors.FeedbackRequiresDelivered;

        var feedbackResult = Feedback.Create(this.Id, ratingValue, comment);
        if (feedbackResult.IsFailure) return feedbackResult.TopError;

        Feedback = feedbackResult.Value;
        FeedbackId = feedbackResult.Value.Id;
        return Result.Success();
    }

    /// <summary>
    /// Opens a dispute for the order. Disputes are allowed only after the order is confirmed/shipped.
    /// </summary>
    /// <param name="reasonText">The explanation for opening the dispute.</param>
    /// <returns>A result representing the outcome of the operation.</returns>
    public Result OpenDispute(string reasonText)
    {
        if (DisputeId is not null) return OrderErrors.DisputeAlreadyExists;
        if (Status == OrderStatus.Pending || Status == OrderStatus.Confirmed) return OrderErrors.CannotDispute;

        var disputeResult = Dispute.Create(this.Id, reasonText);
        if (disputeResult.IsFailure) return disputeResult.TopError;

        Dispute = disputeResult.Value;
        DisputeId = disputeResult.Value.Id;
        return Result.Success();
    }

    /// <summary>
    /// Resolves an existing dispute by delegating the logic to the <see cref="Dispute"/> entity.
    /// </summary>
    public Result ResolveDispute()
    {
        if (Dispute is null) return OrderErrors.NoDispute;

        var resolutionResult = Dispute.Resolve();
        if (resolutionResult.IsFailure) return resolutionResult.TopError;

        return Result.Success();
    }

    /// <summary>
    /// Allows a seller to reply to the feedback left on this order.
    /// </summary>
    /// <param name="replyText">The seller's response text.</param>
    public Result ReplyToFeedback(string replyText)
    {
        if (Feedback is null) return OrderErrors.NoFeedback;

        var replyResult = Feedback.AddReply(replyText);
        if (replyResult.IsFailure) return replyResult.TopError;

        return Result.Success();
    }
}