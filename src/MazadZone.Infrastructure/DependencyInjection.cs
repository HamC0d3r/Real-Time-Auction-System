using MazadZone.Domain.Repositories;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace MazadZone.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructureServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Connection String from appsettings.json
        var connectionString = configuration.GetConnectionString("DefaultConnection");

        // Register EF Core SqlServer
        services.AddDbContext<AppDbContext>(options =>
        options.UseSqlServer(
            configuration.GetConnectionString("DefaultConnection"),
            b => b.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName)));

services.AddScoped<IAuctionRepository, AuctionRepository>();
    services.AddScoped<IUnitOfWork, UnitOfWork>();


        // Register Repositories here
        // services.AddScoped<IAuctionRepository, AuctionRepository>();

        return services;
    }
}