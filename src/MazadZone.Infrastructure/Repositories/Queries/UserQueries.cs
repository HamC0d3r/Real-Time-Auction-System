using MazadZone.Application.Services;
using MazadZone.Domain.Primitives.Results;
using MazadZone.Domain.Shared.ValueObjects;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Infrastructure.Repositories.Queries;

public class UserQueries : IUserQueries
{
    public Task<Result<Address>> GetAddressByIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }

    public Task<Result<Email>> GetEmailByIdAsync(Guid userId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}