using System.Text.Json.Serialization;

namespace MazadZone.Domain.Primitives.Results;

public class Result<TValue> : Result
{
    private readonly TValue? _value;

    protected internal Result(TValue? value, bool isSuccess, Error error)
        : base(isSuccess, error) =>
        _value = value;

    public TValue Value => IsSuccess
        ? _value!
        : throw new InvalidOperationException("The value of a failure result can not be accessed.");

    [JsonConstructor]
    public Result(TValue? value, bool isSuccess,  List<Error>? errors) 
        : base(isSuccess, errors?.FirstOrDefault() ?? Error.None)
    {
        _value = value;
    }

    public static new Result<TValue> Failure(Error error) => new(default, false, error);

    public TNextValue Match<TNextValue>(Func<TValue, TNextValue> onValue, Func<List<Error>, TNextValue> onError)
        => IsSuccess ? onValue(Value!) : onError(Errors);

    public static implicit operator Result<TValue>(TValue? value) => Create(value);
    public static implicit operator Result<TValue>(Error error) => Failure<TValue>(error);
}