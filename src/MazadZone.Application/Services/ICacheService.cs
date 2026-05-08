namespace MazadZone.Application.Services;

public interface ICacheService
{
    Task<T?> GetAsync<T>(string key, CancellationToken ct = default);
    
    Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken ct = default);
    
    Task RemoveAsync(string key, CancellationToken ct = default);

    // The most important method: Get it if it exists, otherwise create it.
    Task<T> GetOrCreateAsync<T>(
        string key, 
        Func<CancellationToken, Task<T>> factory, 
        TimeSpan? expiration = null, 
        CancellationToken ct = default);
}