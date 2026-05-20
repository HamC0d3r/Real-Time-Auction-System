using MazadZone.Domain.Users.ValueObjects;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace MazadZone.Infrastructure.Persistence.Converters;

class SellerIdConverter : ValueConverter<UserId, Guid>
{
    public SellerIdConverter() 
        : base(id => id.Value, guid =>  UserId.From(guid)) { }
}