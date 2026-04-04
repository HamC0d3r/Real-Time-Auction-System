using FluentValidation;
using MazadZone.Domain.Primitives.Results;
using MediatR;
using System.Reflection; // Required for BindingFlags

namespace MazadZone.Application.Common.Behaviors;

public class ValidationBehavior<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse>
    where TResponse : Result
{
    private readonly IEnumerable<IValidator<TRequest>> _validators;

    public ValidationBehavior(IEnumerable<IValidator<TRequest>> validators)
    {
        _validators = validators;
    }

    public async Task<TResponse> Handle(
        TRequest request,
        RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        if (!_validators.Any())
        {
            return await next();
        }

        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            _validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (failures.Any())
        {
            // Map FluentValidation failures to your Domain Errors
            var errors = failures
                .Select(failure => new Error(
                    code: failure.ErrorCode,
                    message: failure.ErrorMessage,
                    type: ErrorType.Validation,
                    metadata: failure.CustomState as Dictionary<string, object>))
                .ToList();

            return CreateValidationResult<TResponse>(errors);
        }

        return await next();
    }

    private static TResponse CreateValidationResult<TResult>(List<Error> errors)
        where TResult : Result
    {
        var firstError = errors.FirstOrDefault() ?? Error.Validation("ValidationError", "Validation failed");

        // 1. Handle non-generic "Result" (Void)
        if (typeof(TResult) == typeof(Result))
        {
            return (TResponse)(object)Result.Failure(firstError);
        }

        // 2. Handle generic "Result<T>" (e.g., Result<Unit>, Result<ProductDto>)
        // We look for the static "Failure" method on the generic type Result<T>
        var failureMethod = typeof(TResult).GetMethod(
            nameof(Result.Failure),
            BindingFlags.Public | BindingFlags.Static,
            new[] { typeof(Error) } // Ensure we find the overload that takes 1 Error
        );

        // 3. SAFETY CHECK: Did we find the method?
        if (failureMethod is not null)
        {
            var result = failureMethod.Invoke(null, new object[] { firstError });
            return (TResponse)result!;
        }

        // 4. Fallback (If Reflection fails, throw a clear error instead of Crashing with NullReference)
        throw new InvalidOperationException(
            $"Validation Behavior failed. Could not find a 'public static Failure(Error)' method on type '{typeof(TResult).Name}'. " +
            $"Ensure your Result<T> class has this method.");
    }
}