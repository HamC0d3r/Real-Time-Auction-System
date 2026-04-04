using MazadZone.Application;
using MazadZone.Infrastructure;

namespace MazadZone.Api;

public static class DependencyInjection
{
    public static IServiceCollection AddMazadZoneServices(this IServiceCollection services, IConfiguration configuration)
    {

        services.AddInfrastructureServices(configuration)
        .AddApplicationServices();

        return services;
    }
}

