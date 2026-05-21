
using MazadZone.Api;
using MazadZone.Api.Endpoints;
using MazadZone.Api.Endpoints.Bidders;
using MazadZone.Api.Endpoints.Notifications;
using MazadZone.Api.Middlewares;
using MazadZone.Infrastructure.Persistence;
using MazadZone.Infrastructure.Persistence.Seeding;
using Serilog;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using MazadZone.Api.Endpoints.Orders;
using MazadZone.Api.Endpoints.Categories;
using MazadZone.Api.Endpoints.Users;
using MazadZone.Api.Endpoints.Sellers;
using MazadZone.Api.Endpoints.Auth;

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();
try
{
    Log.Information("Starting MazadZone Application.");


    var builder = WebApplication.CreateBuilder(args);


    builder.Services.AddSerilog((services, lc) => lc
        .ReadFrom.Configuration(builder.Configuration)
        .ReadFrom.Services(services));

    builder.Services.AddMazadZoneServices(builder.Configuration);

    builder.Services.AddOpenApi();

    var app = builder.Build();

    app.MapNotificationEndpoints();
    app.MapBidderEndpoints();
    app.MapOrderEndpoints();
    app.MapCategoryEndpoints();
    app.MapUserEndpoints();
    app.MapSellerEndpoints();
    app.MapAuthenticationEndpoints();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();

    }
#region  Seed database
//     if (app.Environment.IsDevelopment())
// {
//     // Create a temporary DI scope
//     using var scope = app.Services.CreateScope();
    
//     var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
//     var seeder = scope.ServiceProvider.GetRequiredService<IDatabaseSeeder>();

//     try
//     {
//         Console.WriteLine("Applying database migrations...");
//         // 1. Ensure the database exists and schema is up to date
//         await dbContext.Database.MigrateAsync();

//         Console.WriteLine("Seeding mock data for MazadZone...");
//         // 2. Execute your MasterDataSeeder
//         await seeder.SeedAsync();
        
//         Console.WriteLine("✅ Database seeded successfully!");
//     }
//     catch (Exception ex)
//     {
//         Console.WriteLine($"❌ Error during database seeding: {ex.Message}");
//     }
// }
#endregion
    app.UseMiddleware<CorrelationIdMiddleware>();
    app.UseSerilogRequestLogging(options =>
{
    options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
    {
        diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
        diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent.ToString());
    };

    // Exclude health check endpoints from request logs
    options.GetLevel = (httpContext, elapsed, ex) =>
    {
        if (httpContext.Request.Path.StartsWithSegments("/health"))
            return Serilog.Events.LogEventLevel.Verbose;

        return elapsed > 500
            ? Serilog.Events.LogEventLevel.Warning
            : Serilog.Events.LogEventLevel.Information;
    };
});
    app.MapScalarApiReference();
app.UseSerilogRequestLogging();
    app.UseHttpsRedirection();

    // Map endpoints


    app.Run();

}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}
