using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users;
using MazadZone.Domain.Users.ValueObjects;
using MazadZone.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MazadZone.Infrastructure.Repositories;

public class UserRepository : GenericRepository<User>, IUserRepository
{
    private readonly AppDbContext _context;

    public UserRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    public Task<User?> GetByEmailAsync(Email email, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<User?> GetByIdWithTokensAsync(UserId id, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<User?> GetByRefreshTokenAsync(string refreshToken, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<bool> IsBidderAsync(UserId userId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<bool> IsEmailInUseAsync(Email email, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public async Task<bool> IsUserSellerAsync(UserId userId, CancellationToken cancellationToken)
    {
        return await _context.Users
            .AsNoTracking()
            .AnyAsync(u => u.Id == userId.Value && u.IsSeller);
    }
}