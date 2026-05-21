using MazadZone.Domain.Shared.Interfaces;

namespace MazadZone.Infrastructure.Persistence.Seeding;

public interface IDatabaseSeeder : IScopedService
{
    Task SeedAsync();
}