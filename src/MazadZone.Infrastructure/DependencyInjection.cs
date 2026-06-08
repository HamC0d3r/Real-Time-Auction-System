using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Polly;
using Hangfire;
using MazadZone.Application.Common.Interfaces;
using MazadZone.Application.Services;
using MazadZone.Domain.Shared.Interfaces;
using MazadZone.Infrastructure.Caching;
using MazadZone.Infrastructure.Configuration;
using MazadZone.Infrastructure.Outbox;
using MazadZone.Infrastructure.Persistence;
using MazadZone.Infrastructure.Persistence.Interceptors;
using AuthService.Infrastructure.Backgrounds;
using MazadZone.Infrastructure.Services;
using MazadZone.Infrastructure.Common;
using Quartz;
using MazadZone.Infrastructure.BackgroundJobs;
using MazadZone.Infrastructure.Scheduling;

namespace MazadZone.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        services
            .AddOutboxPattern(configuration)
            .AddDatabase(configuration)
            .AddPollyPolicies(configuration)
            .AddServiceScanning()
            .AddSignalRServices()
            .AddHangfireServices(configuration)
            .AddCachingServices(configuration)
            .AddBackgroundServices()
            .AddGeminiServices(configuration)
            .AddQuartzJobs();

        services.Configure<GmailOptions>(configuration.GetSection(GmailOptions.GmailOptionsKey));





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
        services.AddSingleton<UpdateAuditableEntitiesInterceptor>();

        // 2. Register EF Core
        services.AddDbContext<AppDbContext>((sp, options) =>
        {
            var interceptor = sp.GetRequiredService<InsertOutboxMessagesInterceptor>();
            var auditableInterceptor = sp.GetRequiredService<UpdateAuditableEntitiesInterceptor>();

            options.UseSqlServer(connectionString, sqlOptions =>
            {
                sqlOptions.EnableRetryOnFailure(
                    maxRetryCount: resilienceOptions.RetryCount,
                    maxRetryDelay: TimeSpan.FromSeconds(resilienceOptions.MaxDelaySeconds),
                    errorNumbersToAdd: null
                );

            })
                   .AddInterceptors(interceptor, auditableInterceptor);
        });

        // 3. Register Dapper
        services.AddSingleton<ISqlConnectionFactory>(new SqlConnectionFactory(connectionString));

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

        // 1. Define Retry Policy
        var retryPolicy = Policy
            .Handle<Exception>()
            .WaitAndRetryAsync(options.RetryCount, retryAttempt =>
                TimeSpan.FromSeconds(Math.Pow(options.BaseDelaySeconds, retryAttempt)),
                (exception, timeSpan, retryCount, context) =>
                {
                    // Log logic here
                });

        // 2. Define Bulkhead Policy
        var bulkheadPolicy = Policy.BulkheadAsync(
            options.BulkheadMaxConcurrentRequests,
            options.BulkheadMaxQueuedRequests,
            onBulkheadRejectedAsync: context =>
            {
                // Log or handle when the bulkhead is full and requests are rejected
                return Task.CompletedTask;
            });

        // 3. Wrap them together 
        // This executes bulkhead first, then retry inside it.
        var combinedPolicy = Policy.WrapAsync(bulkheadPolicy, retryPolicy);

        // Register the wrapped policy
        services.AddSingleton<IAsyncPolicy>(combinedPolicy);

        return services;
    }

    private static IServiceCollection AddCachingServices(this IServiceCollection services, IConfiguration configuration)
    {

        services.AddMemoryCache();
        services.AddStackExchangeRedisCache(options =>
                {
                    options.Configuration = configuration.GetConnectionString("Redis");
                    options.InstanceName = "MazadZone_";
                });
        services.AddScoped<ICacheService, RedisCacheService>();
        return services;
    }

    public static IServiceCollection AddServiceScanning(this IServiceCollection services)
    {
        var infrastructureAssembly = typeof(DependencyInjection).Assembly;
        var applicationAssembly = typeof(MazadZone.Application.DependencyInjection).Assembly;
        var domainAssembly = typeof(MazadZone.Domain.Categories.ICategoryDomainService).Assembly;

        services.Scan(scan => scan
            .FromAssemblies(infrastructureAssembly, applicationAssembly, domainAssembly)
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

    public static IServiceCollection AddSignalRServices(this IServiceCollection services)
    {
        services.AddSignalRCore();
        return services;
    }

    public static IServiceCollection AddHangfireServices(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("MazadZoneDb");

        services.AddHangfire(config => config
            .SetDataCompatibilityLevel(CompatibilityLevel.Version_180)
            .UseSimpleAssemblyNameTypeSerializer()
            .UseRecommendedSerializerSettings()
            .UseSqlServerStorage(connectionString));

        services.AddHangfireServer();

        services.AddScoped<IOrderJobScheduler, HangfireOrderJobScheduler>();
        services.AddScoped<IAuctionJobScheduler, HangfireAuctionJobScheduler>();

        return services;
    }

    // public static IServiceCollection AddPaymentService(this IServiceCollection services)
    // {
    //     
    //     services.AddScoped<IPaymentService, PaymentService>();
    //     return services;
    // }

    public static IServiceCollection AddBackgroundServices(this IServiceCollection services)
    {

        services.AddHostedService<KeyRotationService>();
        return services;
    }

    private static IServiceCollection AddGeminiServices(this IServiceCollection services, IConfiguration configuration)
    {
        services.Configure<Configuration.GeminiOptions>(
            configuration.GetSection(Configuration.GeminiOptions.SectionName));
        return services;
    }

    private static IServiceCollection AddGoogleVisionServices(this IServiceCollection services)
    {
        services.AddSingleton<Google.Cloud.Vision.V1.ImageAnnotatorClient>(sp =>
        {
            var builder = new Google.Cloud.Vision.V1.ImageAnnotatorClientBuilder();

            var credentialsPath = @"../../../Downloads/mazadzonevestion-63efa229c4ad.json";
            if (System.IO.File.Exists(credentialsPath))
            {
                using var stream = new System.IO.FileStream(credentialsPath, System.IO.FileMode.Open, System.IO.FileAccess.Read);
                builder.GoogleCredential = Google.Apis.Auth.OAuth2.CredentialFactory.FromStream<Google.Apis.Auth.OAuth2.ServiceAccountCredential>(stream).ToGoogleCredential();
            }

            return builder.Build();
        });

        services.AddScoped<IIdentityExtractionService, GoogleVisionIdentityExtractionService>();

        return services;

    }
    private static IServiceCollection AddQuartzJobs(this IServiceCollection services)
    {
        services.AddQuartz(config =>
        {
            var shipmentJobKey = new JobKey(nameof(AutoShipmentJob));
            config.AddJob<AutoShipmentJob>(shipmentJobKey)
                  .AddTrigger(trigger => trigger
                      .ForJob(shipmentJobKey)
                      .WithIdentity($"{nameof(AutoShipmentJob)}-trigger")
                      // Run every 2 minutes
                      .WithCronSchedule("0 0/2 * * * ?"));

            var deliveryJobKey = new JobKey(nameof(AutoDeliveryJob));
            config.AddJob<AutoDeliveryJob>(deliveryJobKey)
                  .AddTrigger(trigger => trigger
                      .ForJob(deliveryJobKey)
                      .WithIdentity($"{nameof(AutoDeliveryJob)}-trigger")
                      // Run every 2 minutes
                      .WithCronSchedule("0 0/2 * * * ?"));
        });

        // Start Quartz as a background hosted service
        services.AddQuartzHostedService(options =>
        {
            options.WaitForJobsToComplete = true;
        });

        return services;
    }
}
