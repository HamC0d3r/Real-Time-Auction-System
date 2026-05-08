namespace MazadZone.Api.Endpoints.Auth;

public static class AuthenticationEndpoints
{
    public static void MapAuthenticationEndpoints(this IEndpointRouteBuilder app)
    {
        var versionSet = app.NewApiVersionSet()
                            .HasApiVersion(new ApiVersion(1, 0))
                            .ReportApiVersions()
                            .Build();

        var authGroup = app.MapGroup("api/v{version:apiVersion}/auth")
                           .WithApiVersionSet(versionSet)
                           .MapToApiVersion(1, 0)
                           .WithTags("Authentication");

        // Register Identity Slices
        Login.MapEndpoint(authGroup);
        Refresh.MapEndpoint(authGroup);
        Logout.MapEndpoint(authGroup);
    }
}