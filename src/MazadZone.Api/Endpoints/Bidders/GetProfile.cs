using MazadZone.Application.Features.Bidders.Queries.GetBidderProfile;
using MazadZone.Application.Features.Bidders.DTOs;
using MazadZone.Api.Infrastructure.Binding;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace MazadZone.Api.Endpoints.Bidders;

public static class GetProfile
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapGet("/profile", HandleAsync)
            .RequireAuthorization(Policies.BidderOnly) 
            .WithSummary("Retrieve current bidder's profile")
            .WithDescription("Fetches detailed profile information for the authenticated bidder.")
            .Produces<BidderProfileDto>(StatusCodes.Status200OK)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized) 
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);

        app.MapGet("/{id:guid}", HandleByIdAsync)
            .RequireAuthorization()
            .WithSummary("Retrieve bidder profile by unique ID")
            .WithDescription("Fetches public profile information for a specific bidder ID.")
            .Produces<BidderProfileDto>(StatusCodes.Status200OK)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .ProducesProblem(StatusCodes.Status404NotFound)
            .ProducesProblem(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        BoundUserId boundUserId,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new GetBidderProfileQuery(boundUserId.Value), ct);

        return result.Match(
            onValue: bidderDto => Results.Ok(bidderDto),
            onError: errors => errors.ToProblem());
    }

    private static async Task<IResult> HandleByIdAsync(
        Guid id,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        var result = await sender.Send(new GetBidderProfileQuery(UserId.Load(id)), ct);

        return result.Match(
            onValue: bidderDto => Results.Ok(bidderDto),
            onError: errors => errors.ToProblem());
    }
}