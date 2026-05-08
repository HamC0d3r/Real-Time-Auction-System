namespace MazadZone.Api.Endpoints.Users;

public static class UserEndpoints
{
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var versionSet = app.NewApiVersionSet()
                            .HasApiVersion(new ApiVersion(1, 0))
                            .ReportApiVersions()
                            .Build();

        // Admin/Management Group
        var userGroup = app.MapGroup("api/v{version:apiVersion}/users")
                           .WithApiVersionSet(versionSet)
                           .MapToApiVersion(1, 0)
                           .WithTags("Users Management");

        // Auth/Self-Service Group
        var authGroup = app.MapGroup("/api/auth")
                           .WithTags("Auth")
                           .WithOpenApi();

        // Map Admin Actions
        Activate.MapEndpoint(userGroup);
        Ban.MapEndpoint(userGroup);
        Suspend.MapEndpoint(userGroup);

        // Map Auth Actions
        ChangePassword.MapEndpoint(authGroup);
        ChangeEmail.MapEndpoint(authGroup);
    }
}