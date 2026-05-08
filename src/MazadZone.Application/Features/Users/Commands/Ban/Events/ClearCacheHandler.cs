using MazadZone.Application.Common.Caching;
using MazadZone.Application.Services;
using MazadZone.Domain.Users.Events;

namespace MazadZone.Application.Features.Users.Commands.Ban.Events;
public class ClearCacheHandler : INotificationHandler<UserBannedDomainEvent>
{
    private readonly ICacheService _cacheService;
    private readonly ILogger<ClearCacheHandler> _logger;

    public ClearCacheHandler(ICacheService cacheService, ILogger<ClearCacheHandler> logger)
    {
        _cacheService = cacheService;
        _logger = logger;
    }

    public async Task Handle(UserBannedDomainEvent notification, CancellationToken ct)
    {
        await _cacheService.RemoveAsync(CacheKeys.Users.Profile(notification.UserId), ct);
        BanUserLogs.LogCacheCleared(_logger, notification.UserId);
    }
}