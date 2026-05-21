using MazadZone.Application.Features.Sellers.Queries.GetPrivateDetails;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Sellers;

namespace MazadZone.Api.Endpoints.Sellers;

public static class GetPrivateDetails
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("{id:guid}/private", HandleAsync)
           .WithSummary("Retrieves private details of a seller")
           .Produces<PrivateSellerDetailsResponse>(StatusCodes.Status200OK)
           .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute]SellerId id,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new GetPrivateSellerDetailsQuery(id), ct);
        return result.Match(response => Results.Ok(response), e => e.ToProblem());
    }
}