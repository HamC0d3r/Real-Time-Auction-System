namespace MazadZone.Domain.Payments.Enums;

public enum PaymentStatus
{
    Pending = 1,
    Authorized = 2, // Funds are held, not captured
    Completed = 3,  // Funds are successfully captured
    Failed = 4,
    Refunded = 5
}