using MazadZone.Domain.Payments.Enums;

namespace MazadZone.Domain.Payments.Errors;


public static class PaymentErrorsCodes
{
    public const string AmountMustBeGreaterThanZero = "Payment.AmountMustBeGreaterThanZero";
    
    public const string DuplicateTransaction = "Payment.DuplicateTransaction";
    
    public const string NotFound = "Payment.NotFound";

    public const string TransactionNotFound = "Payment.TransactionNotFound";
    public const string cannotComplete = "Payment.CannotComplete";
    public const string InvalidState = "Payment.InvalidState";
    public const string AlreadyProcessed = "Payment.AlreadyProcessed";
}

public static class PaymentErrors
{
    public static readonly Error AmountMustBeGreaterThanZero = Error.Validation(
        PaymentErrorsCodes.AmountMustBeGreaterThanZero, 
        "Payment amount must be greater than zero.");

    public static readonly Error DuplicateTransaction = Error.Conflict(
        PaymentErrorsCodes.DuplicateTransaction, 
        "A transaction with the same gateway intent ID already exists for this payment.");

    public static readonly Error TransactionNotFound = Error.NotFound(
        PaymentErrorsCodes.TransactionNotFound, 
        "Transaction not found for the given gateway intent ID.");
     public static readonly Error NotFound = Error.NotFound(
        PaymentErrorsCodes.NotFound, 
        "Payment not found.");
    public static readonly Error InvalidState = Error.Conflict(
        PaymentErrorsCodes.InvalidState, 
        "Payment cannot be modified in its current state.");

    public static Error CannotComplete(PaymentStatus currentStatus) => Error.Conflict(
        PaymentErrorsCodes.cannotComplete, 
        $"Payment cannot be completed because it is already {currentStatus}.");

    public static Error AlreadyProcessed(PaymentStatus currentStatus) => Error.Conflict(
        PaymentErrorsCodes.AlreadyProcessed, 
        $"Payment cannot be modified because it is already {currentStatus}.");
}