namespace MzadZone.Domain.Payments.Entities;

public enum TransactionType
{
    AuthorizationHold = 1, // An authorization hold is placed on the buyer's payment method for the amount of the winning bid. This ensures that the funds are reserved and will be available when the payment is captured.
    DepositCaptured = 2, // A capture transaction is used to transfer the funds from the authorized amount to the merchant's account.
    RemainingAmountCapture = 3, // If the winning bid was placed with a deposit, this transaction type is used to capture the remaining amount after the auction ends.
    Refund = 4 // A refund transaction is used to return funds to the buyer, either for a full refund or a partial refund in case of disputes or cancellations.
}
