using MazadZone.Api.OpenApi.Transformers;
using MazadZone.Application;
using MazadZone.Infrastructure;
using Serilog;

namespace MazadZone.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddMazadZoneServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddApiVersioning(options =>
        {
            options.DefaultApiVersion = new ApiVersion(1);
            options.AssumeDefaultVersionWhenUnspecified = true;
            options.ReportApiVersions = true; // This registers the missing IReportApiVersions service
        });

        services.AddInfrastructureServices(configuration)
        .AddApplicationServices();

        return services;
    }

private static IServiceCollection AddApiDocumentation(this IServiceCollection services)
    {

        services.AddOpenApi("v1", options =>
        {
            // Use transformer class
            options.AddDocumentTransformer<DefaultInfoTransformer>();


            // Security Scheme config
            options.AddDocumentTransformer<BearerSecuritySchemeTransformer>();
            options.AddOperationTransformer<BearerSecuritySchemeTransformer>();
        });

        return services;
    }
    public static WebApplicationBuilder AddSerilogLogging(this WebApplicationBuilder builder)
    {
        // Now you can access 'builder.Host'
        builder.Host.UseSerilog((context, loggerCongiguration) =>
            loggerCongiguration.ReadFrom.Configuration(context.Configuration));

        return builder;
    }
}

