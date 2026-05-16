using MazadZone.Application.Features.Sellers.Commands.BecomeSeller;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Api.Endpoints.Sellers;

public record BecomeSellerRequest(string BankAccountNumber);

public static class BecomeSeller
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("{id:guid}/become-seller", BecomeSellerAsync)
           .WithSummary("Promotes a bidder to a seller")
           .Produces(StatusCodes.Status204NoContent)
           .Produces(StatusCodes.Status400BadRequest)
           .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> BecomeSellerAsync(
        UserId id,
        [FromBody] BecomeSellerRequest request,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new BecomeSellerCommand(id, request.BankAccountNumber), ct);
        return result.Match(_ => Results.NoContent(), e => e.ToProblem());
    }
}