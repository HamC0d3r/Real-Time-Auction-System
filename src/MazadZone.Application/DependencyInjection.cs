using Microsoft.Extensions.DependencyInjection;
using System.Reflection;
using FluentValidation;

namespace MazadZone.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        var assembly = Assembly.GetExecutingAssembly();

        // Register MediatR
        services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(assembly));

        // Register AutoMapper
        services.AddAutoMapper(assembly);

        // Register FluentValidation
        services.AddValidatorsFromAssembly(assembly);

        return services;
    }
}