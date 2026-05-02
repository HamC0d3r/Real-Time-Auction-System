
using MazadZone.Api.Middlewares;
using Serilog;

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


    builder.Services.AddOpenApi();

    var app = builder.Build();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
    }

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

    app.UseHttpsRedirection();

    // Map endpoints
    app.MapNotificationEndpoints();

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







