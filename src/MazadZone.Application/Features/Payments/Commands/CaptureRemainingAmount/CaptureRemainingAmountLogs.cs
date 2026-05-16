namespace MazadZone.Application.Features.Payments.Commands.CaptureRemainingAmount;

internal static partial class CaptureRemainingAmountLogs
{
    [LoggerMessage(
        EventId = MazadLogEvents.Payments.CaptureRemainingAttempt,
        Level = LogLevel.Information,
        Message = "Attempting to capture remaining amount for Order {OrderId}")]
    public static partial void LogAttempt(ILogger logger, OrderId orderId);

    [LoggerMessage(
        EventId = MazadLogEvents.Payments.CaptureRemainingSuccess,
        Level = LogLevel.Information,
        Message = "Successfully captured remaining amount for Order {OrderId}")]
    public static partial void LogSuccess(ILogger logger, OrderId orderId);

    [LoggerMessage(
        EventId = MazadLogEvents.Payments.CaptureRemainingFailure,
        Level = LogLevel.Error,
        Message = "Failed to capture remaining amount for Order {OrderId}. Error: {ErrorMessage}")]
    public static partial void LogFailure(ILogger logger, OrderId orderId, string errorMessage);

    [LoggerMessage(
        EventId = MazadLogEvents.Payments.PaymentNotFound,
        Level = LogLevel.Warning,
        Message = "No payment found for Order {OrderId} during remaining amount capture")]
    public static partial void LogPaymentNotFound(ILogger logger, OrderId orderId);

    [LoggerMessage(
        EventId = MazadLogEvents.Payments.CaptureRemainingGatewayFailure,
        Level = LogLevel.Warning,
        Message = "Payment gateway failed to capture remaining amount for Order {OrderId}")]
    public static partial void LogCaptureFailed(ILogger logger, OrderId orderId);
}
