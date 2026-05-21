using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using MazadZone.Domain.Users;

namespace MazadZone.Infrastructure.Persistence.Converters;

public class UserRolesBitmaskConverter : ValueConverter<HashSet<UserRole>, int>
{
    public UserRolesBitmaskConverter() : base(
        roles => ConvertToBitmask(roles),
        value => ConvertToHashSet(value))
    {
    }

    private static int ConvertToBitmask(HashSet<UserRole> roles)
    {
        if (roles is null || roles.Count == 0) return 0;
        
        return roles.Aggregate(0, (current, role) => current | (int)role);
    }

    private static HashSet<UserRole> ConvertToHashSet(int value)
    {
        var rolesHashSet = new HashSet<UserRole>();
        
        foreach (UserRole role in Enum.GetValues<UserRole>())
        {
            // Skip the 'None' flag if it exists, as it doesn't represent a functional role
            if (role == UserRole.None) continue;

            if ((value & (int)role) == (int)role)
            {
                rolesHashSet.Add(role);
            }
        }

        return rolesHashSet;
    }
}