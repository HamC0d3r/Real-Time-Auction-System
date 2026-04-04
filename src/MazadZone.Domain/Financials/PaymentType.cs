namespace MazadZone.Domain.Financials;
public enum PaymentType
{
    Deposit = 1,          // The initial hold/charge to place a bid
    RemainingBalance = 2, // The final charge when the auction is won
    FullAmount = 3
}