using MazadZone.Application.Common.Interfaces;
using MazadZone.Application.Services;
using MazadZone.Domain.Entities.Orders;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Shared.Interfaces;
using MazadZone.Infrastructure.Configuration;
using MazadZone.Infrastructure.Outbox;
using MazadZone.Infrastructure.Persistence;
using MazadZone.Infrastructure.Persistence.Interceptors;
using MazadZone.Infrastructure.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;

namespace MazadZone.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {

        services
            .AddDatabase(configuration)
            .AddRepositories()
            .AddOutboxPattern(configuration)
            .AddPollyPolicies(configuration)
            .AddExternalServices(configuration)
            .AddServiceScanning();

        return services;
    }

    private static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
    {
        var resilienceOptions = new ResilienceOptions();
        configuration.GetSection(ResilienceOptions.SectionName).Bind(resilienceOptions);

        var connectionString = configuration.GetConnectionString("MazadZoneDb")
            ?? throw new InvalidOperationException("Default DB connection string not found.");

        // 1. Register Interceptors
        services.AddSingleton<InsertOutboxMessagesInterceptor>();

        // 2. Register EF Core
        services.AddDbContext<AppDbContext>((sp, options) =>
        {
            var interceptor = sp.GetRequiredService<InsertOutboxMessagesInterceptor>();
            options.UseSqlServer(connectionString, sqlOptions =>
            {
                sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: resilienceOptions.RetryCount,
                    maxRetryDelay: TimeSpan.FromSeconds(resilienceOptions.MaxDelaySeconds),
                    errorNumbersToAdd: null
                );

            })
                   .AddInterceptors(interceptor);
        });

        // 3. Register Dapper
        services.AddSingleton<ISqlConnectionFactory>(new SqlConnectionFactory(connectionString));

        return services;
    }

    private static IServiceCollection AddRepositories(this IServiceCollection services)
    {
        services.AddScoped<IUnitOfWork, UnitOfWork>();
        services.AddScoped<IOrderQueries, OrderQueries>();
        services.AddScoped<IOrderRepository, OrderRepository>();

        return services;
    }

    private static IServiceCollection AddOutboxPattern(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<OutboxOptions>(configuration.GetSection(OutboxOptions.SectionName));
        services.AddHostedService<ProcessOutboxMessagesJob>();

        return services;
    }

    private static IServiceCollection AddPollyPolicies(this IServiceCollection services, IConfiguration configuration)
    {
        var options = new ResilienceOptions();
        configuration.GetSection(ResilienceOptions.SectionName).Bind(options);

        // Define a policy that handles common transient errors (database timeouts, network issues)
        var retryPolicy = Policy
            .Handle<Exception>() // You can refine this to HttpRequestException, SqlException, etc.
            .WaitAndRetryAsync(options.RetryCount, retryAttempt =>
                TimeSpan.FromSeconds(Math.Pow(options.BaseDelaySeconds, retryAttempt)),
                (exception, timeSpan, retryCount, context) =>
                {
// Log.Warning("Retry {Count} after {Delay}s due to {Error}", retryCount, timeSpan.TotalSeconds, exception.Message);
                });

        services.AddSingleton<IAsyncPolicy>(retryPolicy);

        return services;
    }

    private static IServiceCollection AddExternalServices(this IServiceCollection services, IConfiguration configuration)
    {

        return services;
    }

public static IServiceCollection AddServiceScanning(this IServiceCollection services)
    {
        services.Scan(scan => scan
            .FromAssemblies(AppDomain.CurrentDomain.GetAssemblies())
            // Register Scoped Services
            .AddClasses(classes => classes.AssignableTo<IScopedService>())
                .AsImplementedInterfaces()
                .WithScopedLifetime()
            // Register Transient Services
            .AddClasses(classes => classes.AssignableTo<ITransientService>())
                .AsImplementedInterfaces()
                .WithTransientLifetime()
            // Register Singleton Services
            .AddClasses(classes => classes.AssignableTo<ISingletonService>())
                .AsImplementedInterfaces()
                .WithSingletonLifetime()
        );

        return services;
    }
}