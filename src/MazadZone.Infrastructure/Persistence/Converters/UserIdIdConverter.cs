using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Infrastructure.Persistence.Converters;

public class UserIdIdConverter : ValueConverter<UserId, Guid>
{
    public UserIdIdConverter() 
        : base(id => id.Value, guid =>  UserId.From(guid)) { }
}
