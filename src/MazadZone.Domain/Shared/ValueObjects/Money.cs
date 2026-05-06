using MazadZone.Domain.Shared.Errors;
using MazadZone.Domain.ValueObjects;

namespace MazadZone.Domain.Orders;

public sealed record Money : IComparable<Money>
{
    public decimal Amount { get; init; }
    public Currency Currency { get; init; }


    public static Result<Money> Create(decimal amount, Currency currency )
    {
        if (amount < 0) return MoneyErrors.AmountTooLow;
        
        return new Money(amount, currency);
    }

    private Money(decimal amount, Currency currency)
    {
        Amount = amount;
        Currency = currency;
    }

    // --- Factory Methods ---
    public static Money Zero() => new(0, Currency.Jod);
    
    // --- Business Behaviors ---
    public bool IsZero() => Amount == 0;

    public bool IsNegative() => Amount < 0;

    // --- The Add Implementation ---
    public Money Add(Money other)
    {
        // Guard Clause: Ensure currencies match
        if (Currency != other.Currency)
        {
            throw new InvalidOperationException(
                $"Cannot add {other.Currency} to {Currency}. Currency conversion is required.");
        }

        // Return a NEW instance (Immutability)
        return new Money(Amount + other.Amount, Currency);
    }


    // --- Operator Overloads (The "Rich" part) ---

    public static Money operator +(Money first, Money second)
    {
        if (first.Currency != second.Currency)
        {
            throw new InvalidOperationException("Cannot add amounts with different currencies.");
        }

        return new Money(first.Amount + second.Amount, first.Currency);
    }

    public static Money operator -(Money first, Money second)
    {
        if (first.Currency != second.Currency)
        {
            throw new InvalidOperationException("Cannot subtract amounts with different currencies.");
        }

        return new Money(first.Amount - second.Amount, first.Currency);
    }

    public static Money operator *(Money money, decimal multiplier)
    {
        return new Money(money.Amount * multiplier, money.Currency);
    }

    // --- Comparison Operators ---

    public static bool operator >(Money first, Money second)
    {
        if (first.Currency != second.Currency)
            throw new InvalidOperationException("Cannot compare amounts with different currencies.");

        return first.Amount > second.Amount;
    }

    public static bool operator <(Money first, Money second)
    {
        if (first.Currency != second.Currency)
            throw new InvalidOperationException("Cannot compare amounts with different currencies.");

        return first.Amount < second.Amount;
    }

    public static bool operator >=(Money first, Money second) => first == second || first > second;
    
    public static bool operator <=(Money first, Money second) => first == second || first < second;

    public int CompareTo(Money? other)
    {
        if (other is null) return 1;
        if (Currency != other.Currency)
            throw new InvalidOperationException("Cannot compare amounts with different currencies.");

        return Amount.CompareTo(other.Amount);
    }

    // --- Formatting ---
    public override string ToString() => $"{Amount:N2} {Currency.Code}";
}