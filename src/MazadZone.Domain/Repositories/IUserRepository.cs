using MazadZone.Domain.Users;

namespace MazadZone.Domain.Repositories;
public interface IUserRepository : IGenericRepository<User>
{
    public Task<User?> GetByEmailAsync(Email email, CancellationToken cancellationToken);
    public Task<User?> GetByUsernameAsync(UserName username, CancellationToken cancellationToken);
    public Task<bool> IsEmailInUseAsync(Email email, CancellationToken cancellationToken);
}