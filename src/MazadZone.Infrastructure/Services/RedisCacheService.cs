using System.Text.Json;
using MazadZone.Application.Services;
using Microsoft.Extensions.Caching.Distributed;

namespace MazadZone.Infrastructure.Caching;

public sealed class RedisCacheService : ICacheService
{
    private readonly IDistributedCache _cache;
    
    // Optional: Standardize JSON options so dates and properties serialize consistently
    private readonly JsonSerializerOptions _jsonOptions = new()
    {
        PropertyNameCaseInsensitive = true
    };

    public RedisCacheService(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
    {
        var cachedValue = await _cache.GetStringAsync(key, ct);

        if (string.IsNullOrWhiteSpace(cachedValue))
        {
            return default;
        }

        return JsonSerializer.Deserialize<T>(cachedValue, _jsonOptions);
    }

    public async Task SetAsync<T>(string key, T value, TimeSpan? expiration = null, CancellationToken ct = default)
    {
        var options = new DistributedCacheEntryOptions();

        if (expiration.HasValue)
        {
            // Sets how long the item will stay in Redis before being deleted
            options.AbsoluteExpirationRelativeToNow = expiration;
        }

        var serializedValue = JsonSerializer.Serialize(value, _jsonOptions);

        await _cache.SetStringAsync(key, serializedValue, options, ct);
    }

    public async Task RemoveAsync(string key, CancellationToken ct = default)
    {
        await _cache.RemoveAsync(key, ct);
    }

    public async Task<T> GetOrCreateAsync<T>(
        string key, 
        Func<CancellationToken, Task<T>> factory, 
        TimeSpan? expiration = null, 
        CancellationToken ct = default)
    {
        // 1. Try to get it from cache
        var cachedResult = await GetAsync<T>(key, ct);

        if (cachedResult is not null)
        {
            return cachedResult;
        }

        // 2. If not found, execute the factory method (e.g., call the database)
        var result = await factory(ct);

        // 3. Save the newly fetched data to Redis
        if (result is not null)
        {
            await SetAsync(key, result, expiration, ct);
        }

        return result;
    }
}