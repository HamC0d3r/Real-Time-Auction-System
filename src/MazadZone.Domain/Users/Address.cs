namespace MazadZone.Domain.Entities.Users;

using MazadZone.Domain.Primitives;

public sealed class Address : Entity<AddressId>
{
    // Parameterless constructor for EF Core
    private Address() { }

    private Address(AddressId id, UserId userId, string city, string street) : base(id)
    {
        UserId = userId;
        City = city;
        Street = street;
    }

    // --- Properties ---
    public UserId UserId { get; private init; }
    public string City { get; private set; }
    public string Street { get; private set; }

    // --- Factory Method ---
    // Marked internal so only the User Aggregate Root can instantiate it
    internal static Address Create(UserId userId, string city, string street)
    {
        if (string.IsNullOrWhiteSpace(city))
            throw new ArgumentException("City cannot be empty.", nameof(city));

        if (string.IsNullOrWhiteSpace(street))
            throw new ArgumentException("Street cannot be empty.", nameof(street));

        return new Address(new AddressId(Guid.NewGuid()), userId, city, street);
    }

    // --- Operations ---
    // Marked internal so the User aggregate orchestrates the update
    internal Result Update(string city, string street)
    {
        if (string.IsNullOrWhiteSpace(city))
            return Result.Failure(new Error("Address.EmptyCity", "City cannot be empty."));

        if (string.IsNullOrWhiteSpace(street))
            return Result.Failure(new Error("Address.EmptyStreet", "Street cannot be empty."));

        City = city;
        Street = street;

        return Result.Success();
    }
}