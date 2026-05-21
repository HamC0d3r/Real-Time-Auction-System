using MazadZone.Domain.Shared.Interfaces;

public interface IUnitOfWork : IScopedService
{
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}