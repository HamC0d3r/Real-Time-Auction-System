namespace MazadZone.Domain.Primitives.Results;

public enum ErrorType
{
    Failure,
    Unexpected,
    Validation,
    Conflict,
    NotFound,
    Unauthorized,
    Forbidden,
    NullValue,
    None,
}
