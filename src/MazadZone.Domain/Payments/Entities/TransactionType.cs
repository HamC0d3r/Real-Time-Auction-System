namespace MzadZone.Domain.Payments.Entities;

public enum TransactionType
{
    AuthorizationHold = 1, // An authorization hold is placed on the buyer's payment method for the amount of the winning bid. This ensures that the funds are reserved and will be available when the payment is captured.
    Capture = 2, // A capture transaction is used to transfer the funds from the authorized amount to the merchant's account.
    Void = 3, // A void transaction is used to cancel an authorized amount before it is captured.
    Refund = 4 // A refund transaction is used to return funds to the customer.
}
