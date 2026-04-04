// using MazadZone.Domain.Primitives.Results;
// using MediatR;
// using Microsoft.Extensions.Caching.Hybrid;
// using Microsoft.Extensions.Logging;
// using SharedKernel.Abstractions.Messaging;

// namespace SharedKernel.Behaviors;

// public class InvalidateCacheBehavior<TRequest, TResponse>(
//     HybridCache cache,
//     ILogger<InvalidateCacheBehavior<TRequest, TResponse>> logger)
//     : IPipelineBehavior<TRequest, TResponse>
//     where TRequest : notnull
// {
//     public async Task<TResponse> Handle(
//         TRequest request,
//         RequestHandlerDelegate<TResponse> next,
//         CancellationToken cancellationToken)
//     {
//         var response = await next();

//         if (request is IInvalidateCache invalidateCacheCommand && 
//             response is Result result && 
//             result.IsSuccess)
//         {
//             logger.LogInformation("Invalidating cache for tags: {Tags}", string.Join(", ", invalidateCacheCommand.Tags));
            
//             foreach (var tag in invalidateCacheCommand.Tags)
//             {
//                 await cache.RemoveByTagAsync(tag, cancellationToken);
//             }
//         }

//         return response;
//     }
// }