
namespace MazadZone.Infrastructure.Repositories;
public class UnitOfWork : IUnitOfWork
{
    private readonly AppDbContext _context;
    public UnitOfWork(AppContext context) => _context = context;

    public Task<int> SaveChangesAsync(CancellationToken cancellationToken = default) 
        => _context.SaveChangesAsync(cancellationToken);
}