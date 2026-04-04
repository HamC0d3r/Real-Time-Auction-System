
// using MazadZone.Domain.Primitives.Results;
// using MediatR;
// using Microsoft.Extensions.Caching.Hybrid;
// using Microsoft.Extensions.Logging;
// using SharedKernel.Abstractions.Messaging;

// namespace SharedKernel.Behaviors;

// public class CachingBehavior<TRequest, TResponse>(
//     HybridCache cache,
//     ILogger<CachingBehavior<TRequest, TResponse>> logger)
//     : IPipelineBehavior<TRequest, TResponse>
//     where TRequest : notnull
// {
//     private readonly HybridCache _cache = cache;
//     private readonly ILogger<CachingBehavior<TRequest, TResponse>> _logger = logger;

//     public async Task<TResponse> Handle(
//         TRequest request,
//         RequestHandlerDelegate<TResponse> next,
//         CancellationToken ct)
//     {
//         if (request is not ICachedQuery cachedRequest)
//         {
//             return await next();
//         }

//         _logger.LogInformation("Checking cache for {RequestName}", typeof(TRequest).Name);

//         var result = await _cache.GetOrCreateAsync<TResponse>(
//             cachedRequest.CacheKey,
//             _ => new ValueTask<TResponse>((TResponse)(object)null!),
//             new HybridCacheEntryOptions
//             {
//                 Flags = HybridCacheEntryFlags.DisableUnderlyingData
//             },
//             cancellationToken: ct);

//         if (result is null)
//         {
//             result = await next();

//             if (result is Result res && res.IsSuccess)
//             {
//                 _logger.LogInformation("Caching result for {RequestName}", typeof(TRequest).Name);

//                 await _cache.SetAsync(
//                     cachedRequest.CacheKey,
//                     result,
//                     new HybridCacheEntryOptions
//                     {
//                         Expiration = cachedRequest.Expiration
//                     },
//                     cachedRequest.Tags,
//                     ct);
//             }
//         }

//         return result;
//     }
// }