namespace MazadZone.Domain.Primitives.Results;

public class Error : IEquatable<Error>
{
    public static readonly Error None = new(string.Empty, string.Empty, ErrorType.None);
    public static readonly Error NullValue = new("Error.NullValue", "The specified result value is null.", ErrorType.NullValue);

    public Error(string code, string message, ErrorType type, Dictionary<string, object>? metadata = null)
    {
        Code = code;
        Message = message;
        Type = type;
        Metadata = metadata;
    }

    public string Code { get; }

    public string Message { get; }

    public ErrorType Type{ get; }
    public Dictionary<string, object>? Metadata { get; }


    public static implicit operator string(Error error) => error.Code;
    public static implicit operator Result(Error error) => Result.Failure(error);

    public static Error Failure(string code = nameof(Failure), string description = "General failure.")
            => new(code, description, ErrorType.Failure);

    public static Error Unexpected(string code = nameof(Unexpected), string description = "Unexpected error.")
        => new(code, description, ErrorType.Unexpected);

    public static Error Validation(string code = nameof(Validation), string description = "Validation error")
        => new(code, description, ErrorType.Validation);

    public static Error Conflict(string code = nameof(Conflict), string description = "Conflict error")
        => new(code, description, ErrorType.Conflict);

    public static Error NotFound(string code = nameof(NotFound), string description = "Not found error")
        => new(code, description, ErrorType.NotFound);

    public static Error Unauthorized(string code = nameof(Unauthorized), string description = "Unauthorized error")
        => new(code, description, ErrorType.Unauthorized);

    public static Error Forbidden(string code = nameof(Forbidden), string description = "Forbidden error")
        => new(code, description, ErrorType.Forbidden);

    public static Error Create(ErrorType type, string code, string description)
        => new(code, description, type);


    public static bool operator ==(Error? a, Error? b)
    {
        if (a is null && b is null)
        {
            return true;
        }

        if (a is null || b is null)
        {
            return false;
        }

        return a.Equals(b);
    }

    public static bool operator !=(Error? a, Error? b) => !(a == b);

    public virtual bool Equals(Error? other)
    {
        if (other is null)
        {
            return false;
        }

        return Code == other.Code && Message == other.Message;
    }

    public override bool Equals(object? obj) => obj is Error error && Equals(error);

    public override int GetHashCode() => HashCode.Combine(Code, Message);

    public override string ToString() => Code;


}
