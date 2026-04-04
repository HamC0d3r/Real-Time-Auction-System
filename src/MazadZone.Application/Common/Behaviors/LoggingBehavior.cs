using MazadZone.Domain.Primitives.Results;
using MediatR;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace MazadZone.Application.Common.Behaviors;

public class LoggingBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly ILogger<LoggingBehavior<TRequest, TResponse>> _logger;

    public LoggingBehavior(ILogger<LoggingBehavior<TRequest, TResponse>> logger)
    {
        _logger = logger;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        
        // 1. Log Entry
        _logger.LogInformation("Processing Request {RequestName}", requestName);
        
        var stopwatch = Stopwatch.StartNew();

        // 2. Execute the Handler
        var response = await next();

        stopwatch.Stop();
        var elapsedMs = stopwatch.ElapsedMilliseconds;

        // 3. Inspect Result for Domain Errors
        // We check if the response is a 'Result' and if it failed
        if (IsFailureResult(response, out Error? error))
        {
            // Log as WARNING because it's a business logic failure (not a crash)
            _logger.LogWarning(
                "Request {RequestName} failed in {ElapsedMs}ms. Error: {ErrorCode} - {ErrorMessage}",
                requestName,
                elapsedMs,
                error?.Code,
                error?.Message);
        }
        else
        {
            // 4. Log Success
            _logger.LogInformation(
                "Completed Request {RequestName} in {ElapsedMs}ms.",
                requestName,
                elapsedMs);
        }

        return response;
    }

    // Helper to safely extract Error from Result objects via Reflection
    // (Necessary because TResponse is generic)
    private bool IsFailureResult(object? response, out Error? error)
    {
        error = null;
        if (response is null) return false;

        // 1. Check for non-generic Result
        if (response is Result result && result.IsFailure)
        {
            error = result.TopError; 
            return true;
        }

        // 2. Check for generic Result<T>
        var type = response.GetType();
        if (type.IsGenericType && type.GetGenericTypeDefinition() == typeof(Result<>))
        {
            // Reflection to get .IsFailure property
            var isFailureProp = type.GetProperty("IsFailure");
            var isFailure = (bool?)isFailureProp?.GetValue(response);

            if (isFailure == true)
            {
                // Reflection to get .TopError (or .Error) property
                var errorProp = type.GetProperty("TopError") ?? type.GetProperty("Error");
                error = errorProp?.GetValue(response) as Error;
                return true;
            }
        }

        return false;
    }
}
