using MazadZone.Domain.Primitives.Results;

using Microsoft.AspNetCore.Mvc;

namespace MechanicShop.Api.Extensions;

public static class ProblemExtensions
{
    public static IResult ToProblem(this List<Error> errors)
    {
        if (errors.Count == 0)
        {
            return Results.Problem();
        }

        if (errors.All(error => error.Type == ErrorType.Validation))
        {
            return ValidationProblem(errors);
        }

        return Problem(errors[0]);
    }

    private static IResult Problem(Error error)
    {
        var statusCode = error.Type switch
        {
            ErrorType.Conflict => StatusCodes.Status409Conflict,
            ErrorType.Validation => StatusCodes.Status400BadRequest,
            ErrorType.NotFound => StatusCodes.Status404NotFound,
            ErrorType.Unauthorized => StatusCodes.Status403Forbidden,
            _ => StatusCodes.Status500InternalServerError,
        };

        return Results.Problem(statusCode: statusCode, title: error.Message);
    }

    private static IResult ValidationProblem(List<Error> errors)
    {
        var errorsDict = errors.ToDictionary(e => e.Code, e => new[] { e.Message });

        var problemDetails = new ValidationProblemDetails(errorsDict)
        {
            Status = StatusCodes.Status400BadRequest
        };

        return Results.Json(problemDetails, statusCode: StatusCodes.Status400BadRequest);
    }
}