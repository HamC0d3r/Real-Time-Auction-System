namespace MazadZone.Domain.Payments.Enums;

public enum PaymentStatus
{
    Pending = 1,
    Authorized = 2, // Funds are held, not captured
    AuthorizedAmountCaptured = 3,   // Funds are successfully captured
    Completed = 4,  // Funds are successfully captured
    Failed = 5,
    Refunded = 6
}