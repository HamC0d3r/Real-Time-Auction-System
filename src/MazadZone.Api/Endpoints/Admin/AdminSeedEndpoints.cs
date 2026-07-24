using MazadZone.Api.Constants;
using MazadZone.Application.Features.Admin.DTOs;
using MazadZone.Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace MazadZone.Api.Endpoints.Admin;

public static class AdminSeedEndpoints
{
    public static void MapAdminSeedEndpoints(this IEndpointRouteBuilder app)
    {
        var versionSet = app.NewApiVersionSet()
                            .HasApiVersion(new ApiVersion(1, 0))
                            .ReportApiVersions()
                            .Build();

        var seedGroup = app.MapGroup("api/v{version:apiVersion}/admin/seed")
                           .WithApiVersionSet(versionSet)
                           .MapToApiVersion(1, 0)
                           .WithTags("Admin Seed Management");

        // POST /api/v1/admin/seed/generate
        seedGroup.MapPost("/generate", async (
            [FromBody] SeedGenerateRequestDto request,
            [FromServices] ISeedService seedService,
            CancellationToken ct) =>
        {
            var result = await seedService.GenerateSeedsAsync(request, ct);
            return Results.Ok(result);
        })
        .RequireAuthorization(Policies.AdminOnly)
        .WithSummary("Generate dynamic sysdate auction seeds")
        .WithDescription("Creates realistic auctions with close sysdate timestamps and working live timers.");

        // DELETE /api/v1/admin/seed/purge
        seedGroup.MapDelete("/purge", async (
            [FromQuery] bool purgeAll,
            [FromServices] ISeedService seedService,
            CancellationToken ct) =>
        {
            var result = await seedService.PurgeSeedsAsync(purgeAllAuctions: purgeAll, ct);
            return Results.Ok(result);
        })
        .RequireAuthorization(Policies.AdminOnly)
        .WithSummary("Purge database auctions")
        .WithDescription("Deletes all auctions & bids from database while preserving admin accounts & base categories.");

        // POST /api/v1/admin/seed/reset
        seedGroup.MapPost("/reset", async (
            [FromBody] SeedGenerateRequestDto request,
            [FromServices] ISeedService seedService,
            CancellationToken ct) =>
        {
            var result = await seedService.ResetSeedsAsync(request, ct);
            return Results.Ok(result);
        })
        .RequireAuthorization(Policies.AdminOnly)
        .WithSummary("Atomic reset: Purge database + Generate fresh sysdate seeds")
        .WithDescription("Wipes existing auction data and re-populates a fresh dynamic auction dataset.");

        // GET /api/v1/admin/seed/stats
        seedGroup.MapGet("/stats", async (
            [FromServices] ISeedService seedService,
            CancellationToken ct) =>
        {
            var stats = await seedService.GetStatsAsync(ct);
            return Results.Ok(stats);
        })
        .RequireAuthorization(Policies.AdminOnly)
        .WithSummary("Get seed statistics")
        .WithDescription("Retrieves totals for active, expiring, upcoming, and ended auctions.");
    }
}
