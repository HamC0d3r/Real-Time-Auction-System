using MazadZone.Domain.Users;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Domain.Repositories;
public interface IUserRepository : IGenericRepository<User>
{
     Task<User?> GetByEmailAsync(Email email, CancellationToken cancellationToken);
     Task<bool> IsEmailInUseAsync(Email email, CancellationToken cancellationToken);
    Task<User?> GetByIdWithTokensAsync(UserId id, CancellationToken cancellationToken);
    Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken);
    Task<bool> IsUserSellerAsync(UserId userId, CancellationToken cancellationToken);
    Task<bool> IsBidderAsync(UserId userId, CancellationToken cancellationToken);

}