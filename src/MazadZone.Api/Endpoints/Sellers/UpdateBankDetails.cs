using MazadZone.Application.Features.Sellers.Commands.UpdateBankDetails;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Sellers;

namespace MazadZone.Api.Endpoints.Sellers;

public record UpdateBankDetailsRequest(string NewAccountNumber);

public static class UpdateBankDetails
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPatch("{id:guid}/bank-details", HandleAsync)
           .WithSummary("Updates seller bank account details")
           .Produces(StatusCodes.Status204NoContent)
           .Produces(StatusCodes.Status400BadRequest)
           .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute]SellerId id,
        [FromBody] UpdateBankDetailsRequest request,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new UpdateBankDetailsCommand(id, request.NewAccountNumber), ct);
        return result.Match(_ => Results.NoContent(), e => e.ToProblem());
    }
}