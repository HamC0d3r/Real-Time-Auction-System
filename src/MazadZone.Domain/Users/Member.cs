namespace MazadZone.Domain.Entities.Users;

public class Member : User // From our previous Member/Admin inheritance setup
{
    private readonly List<Address> _addresses = new();
    
    // ... existing properties (Card, Bidder, Seller) ...

    public IReadOnlyCollection<Address> Addresses => _addresses.AsReadOnly();

    public Result AddAddress(string city, string street)
    {
        // Example Business Rule: A user can only have a maximum of 5 addresses
        if (_addresses.Count >= 5)
            return Result.Failure(new Error("User.AddressLimitReached", "Cannot have more than 5 addresses."));

        var address = Address.Create(this.Id, city, street);
        _addresses.Add(address);

        return Result.Success();
    }

    public Result UpdateAddress(AddressId addressId, string newCity, string newStreet)
    {
        var address = _addresses.FirstOrDefault(a => a.Id == addressId);

        if (address is null)
            return Result.Failure(new Error("User.AddressNotFound", "The specified address was not found in this user's profile."));

        // Delegate the actual data change to the child entity
        return address.Update(newCity, newStreet);
    }
}