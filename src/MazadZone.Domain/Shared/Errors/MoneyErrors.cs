namespace MazadZone.Domain.Shared.Errors;


public static class MoneyErrors
{
    public static Error AmountTooLow = Error.Validation(
        "Money.AmountTooLow",
        "Amount Cannot be negative Value"
    );

}