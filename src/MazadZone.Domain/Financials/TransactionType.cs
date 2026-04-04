namespace MazadZone.Domain.Financials;
public enum TransactionType
{
    Charge = 1,           // Platform charging the buyer
    Refund = 2,           // Platform returning a deposit
    Payout = 3            // Platform sending money to the seller
}