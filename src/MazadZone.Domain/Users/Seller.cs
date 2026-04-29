using MazadZone.Domain.Auctions;

namespace MazadZone.Domain.Users;

public class Seller : User //change another time 
{
    
    // --- Constructors ---
    public Seller(SellerId id, string name, string email) //: base(id, name, email)
    {
    }
    
    // --- Factory Methods ---
   /* public static Seller Create(string name, string email)
    {
        return new Seller(SellerId.CreateUnique(), name, email);
    }*/
}