namespace MazadZone.Domain.Orders;

public static class OrderErrorCodes
{
    // Dispute Errors
    public const string DisputeCannotChangeReason = "Dispute.CannotChange";
    public const string DisputeAlreadyResolved = "Dispute.AlreadyResolved";
    
    
    // Order Dispute Errors
    public const string DisputeAlreadyExists = "Order.DisputeAlreadyExists";
    public const string CannotDispute = "Order.CannotDispute";
    public const string NoDispute = "Order.NoDispute";
    
    // Order Feedback Errors
    public const string FeedbackAlreadyExists = "Order.FeedbackAlreadyExists";
    public const string FeedbackRequiresDelivered = "Order.FeedbackRequiresDelivered";
    public const string FeedbackCommentEmpty = "Order.FeedbackCommentEmpty";
    public const string FeedbackInvalidRating = "Order.FeedbackInvalidRating";
    public const string NoFeedback = "Order.NoFeedback";

    public const string CannotShipped = "Order.CannotShipped";
    public const string CannotConfirm = "Order.CannotConfirm";
    public const string CannotDeliver = "Order.CannotDeliver";
    public const string CannotCancel = "Order.CannotCancel";
    public const string DisputeReasonEmpty = "Order.DisputeReasonEmpty";
    public const string TotalAmountTooLow = "Order.TotalAmountTooLow";

    public const string NotFound = "Order.NotFound";
}

public static class OrderErrors
{
    // --- Dispute Errors ---
    public static Error DisputeCannotChangeReason =>
        Error.Conflict(OrderErrorCodes.DisputeCannotChangeReason, "Cannot change the reason of a resolved dispute.");

    public static Error DisputeAlreadyResolved =>
        Error.Conflict(OrderErrorCodes.DisputeAlreadyResolved, "This dispute is already marked as resolved."); 

    // --- Order State Errors ---
    public static Error CannotShipped =>
        Error.Conflict(OrderErrorCodes.CannotShipped, "Only Confirmed orders can be moved to shipped.");

    public static Error CannotConfirm =>
        Error.Conflict(OrderErrorCodes.CannotConfirm, "Only pending orders can be moved to Confirmed.");

    public static Error CannotDeliver =>
        Error.Conflict(OrderErrorCodes.CannotDeliver, "An order must be shipped before it can be marked as delivered.");


    public static Error CannotCancel =>
        Error.Conflict(OrderErrorCodes.CannotCancel, "This order has already been shipped or Delivered or Shipped and can no longer be cancelled.");


    // --- Order Dispute Errors ---
    public static Error DisputeAlreadyExists =>
        Error.Conflict(OrderErrorCodes.DisputeAlreadyExists, "A dispute already exists for this order.");

    public static Error CannotDispute =>
        Error.Conflict(OrderErrorCodes.CannotDispute, "Cannot open a dispute on a Confirmed or Pending order.");

    public static Error NoDispute =>
        Error.NotFound(OrderErrorCodes.NoDispute, "This order does not have an active dispute.");

    // --- Order Feedback Errors ---
    public static Error FeedbackAlreadyExists =>
        Error.Conflict(OrderErrorCodes.FeedbackAlreadyExists, "Feedback has already been left for this order.");

    public static Error FeedbackRequiresDelivered =>
        Error.Conflict(OrderErrorCodes.FeedbackRequiresDelivered, "Feedback can only be left on delivered orders.");

    public static Error NoFeedback =>
        Error.NotFound(OrderErrorCodes.NoFeedback, "There is no feedback to reply to on this order.");

    public static Error FeedbackCommentEmpty =>
        Error.Validation(OrderErrorCodes.FeedbackCommentEmpty, "Feedback comment cannot be empty.");

    public static Error FeedbackInvalidRating =>
        Error.Validation(OrderErrorCodes.FeedbackInvalidRating, "Rating must be between 1 and 5.");

    public static Error TotalAmountTooLow =>
        Error.Validation(OrderErrorCodes.TotalAmountTooLow, "Total amount must be greater than zero.");

    public static Error NotFound =>
        Error.NotFound(OrderErrorCodes.NotFound, "Order not found with ID : {orderId}.");


}