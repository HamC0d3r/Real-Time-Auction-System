namespace MazadZone.Domain.Repositories;

public interface IGenericRepository<T> where T : class
{
    Task<T?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    
    void Add(T entity);
    
    void Update(T entity);
    
    void Delete(T entity);
}