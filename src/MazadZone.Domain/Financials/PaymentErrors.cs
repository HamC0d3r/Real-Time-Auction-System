namespace MazadZone.Domain.Financials;

public static class PaymentErrors
{
    public static readonly Error InvalidState = Error.Validation(
        "Payment.InvalidState", 
        "Only pending payments can be updated.");

    public static Error AlreadyProcessed(PaymentStatus currentStatus) => Error.Conflict(
        "Payment.AlreadyProcessed", 
        $"Payment cannot be modified because it is already {currentStatus}.");
}