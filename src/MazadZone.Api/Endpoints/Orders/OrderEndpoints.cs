namespace MazadZone.Api.Endpoints.Orders;

public static class OrderEndpoints
{
    public static void MapOrderEndpoints(this IEndpointRouteBuilder app)
    {
        var versionSet = app.NewApiVersionSet()
                            .HasApiVersion(new ApiVersion(1, 0))
                            .ReportApiVersions()
                            .Build();

        var orderGroup = app.MapGroup("api/v{version:apiVersion}/orders")
                           .WithApiVersionSet(versionSet)
                           .MapToApiVersion(1, 0);

        Create.MapEndpoint(orderGroup);
        Confirm.MapEndpoint(orderGroup);
        Ship.MapEndpoint(orderGroup);
        Deliver.MapEndpoint(orderGroup);
        Cancel.MapEndpoint(orderGroup);
        OpenDispute.MapEndpoint(orderGroup);
        ResolveDispute.MapEndpoint(orderGroup);
        AddFeedback.MapEndpoint(orderGroup);

        GetDetails.MapEndpoint(orderGroup);
        Search.MapEndpoint(orderGroup);
        GetByWinningBid.MapEndpoint(orderGroup);
        GetSellerStats.MapEndpoint(orderGroup);
        GetGlobalStats.MapEndpoint(orderGroup);
    }
}