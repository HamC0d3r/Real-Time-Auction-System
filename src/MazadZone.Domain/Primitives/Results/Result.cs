using System.Text.Json.Serialization;

namespace MazadZone.Domain.Primitives.Results;

public class Result
{
    private readonly List<Error> _errors ;
    public List<Error> Errors => IsFailure ? _errors : [];

    [JsonConstructor]
    protected internal Result(bool isSuccess, Error error)
    {
        if (isSuccess && error != Error.None)
        {
            throw new InvalidOperationException();
        }

        if (!isSuccess && error == Error.None)
        {
            throw new InvalidOperationException();
        }

        IsSuccess = isSuccess;
        _errors = [error];
    }

    private Result(List<Error> errors)
    {
        _errors = errors;
        IsSuccess = false;
    }

    public static Result WithErrors(List<Error> errors) => new(errors);
    public Error TopError => (_errors.Count > 0) ? _errors[0] : Error.None;


    public bool IsSuccess { get; }

    public bool IsFailure => !IsSuccess;


    public static Result Success() => new(true, Error.None);

    public static Result<TValue> Success<TValue>(TValue value) => new(value, true, Error.None);

    public static Result Failure(Error error) => new(false, error);

    public static Result<TValue> Failure<TValue>(Error error) => new(default, false, error);

    public static Result<TValue> Create<TValue>(TValue? value) => value is not null ? Success(value) : Failure<TValue>(Error.NullValue);

    /// <summary>
    /// Checks a list of Results. Returns the first failure found. 
    /// If all match, returns Success.
    /// </summary>
    public static Result Combine(params Result[] results)
    {
        foreach (var result in results)
        {
            if (result.IsFailure)
            {
                return result;
            }
        }

        return Success();
    }
}
