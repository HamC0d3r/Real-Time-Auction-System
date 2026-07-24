using MazadZone.Application.Features.Admin.DTOs;
using MazadZone.Domain.Shared.Interfaces;

namespace MazadZone.Application.Services;

public interface ISeedService : IScopedService
{
    Task<SeedOperationResultDto> GenerateSeedsAsync(SeedGenerateRequestDto request, CancellationToken ct = default);
    Task<SeedOperationResultDto> PurgeSeedsAsync(bool purgeAllAuctions = true, CancellationToken ct = default);
    Task<SeedOperationResultDto> ResetSeedsAsync(SeedGenerateRequestDto request, CancellationToken ct = default);
    Task<SeedStatsDto> GetStatsAsync(CancellationToken ct = default);
}
