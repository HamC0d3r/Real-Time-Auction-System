using MazadZone.Application.Features.Bidders.Queries.GetBidderProfile;
using MazadZone.Application.Features.Bidders.DTOs;
using MazadZone.Domain.Bidders;

namespace MazadZone.Api.Endpoints.Bidders;

public static class GetProfile
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/{id:guid}", HandleAsync)
           .WithSummary("Retrieves a Bidder's Profile")
           .WithDescription("Gets detailed profile information for a specific bidder.")
           .Produces<BidderProfileDto>(StatusCodes.Status200OK)
           .Produces(StatusCodes.Status400BadRequest)
           .Produces(StatusCodes.Status404NotFound)
           .Produces(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromRoute] BidderId id,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var query = new GetBidderProfileQuery(id);
        var result = await sender.Send(query, ct);

        return result.Match(
            onValue: bidderDto => Results.Ok(bidderDto),
            onError: errors => errors.ToProblem());
    }
}