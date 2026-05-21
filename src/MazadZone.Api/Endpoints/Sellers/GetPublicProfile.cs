using MazadZone.Application.Features.Sellers.Queries.GetPublicProfile;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Sellers;

namespace MazadZone.Api.Endpoints.Sellers;

public static class GetPublicProfile
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("{id:guid}/public", HandleAsync)
           .WithSummary("Retrieves a seller's public profile")
           .Produces<PublicSellerProfileResponse>(StatusCodes.Status200OK)
           .Produces(StatusCodes.Status404NotFound);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute]SellerId id,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new GetPublicSellerProfileQuery(id), ct);
        return result.Match(response => Results.Ok(response), e => e.ToProblem());
    }
}