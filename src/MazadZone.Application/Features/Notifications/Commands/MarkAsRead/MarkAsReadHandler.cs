using Microsoft.Extensions.Logging;
using MazadZone.Domain.Notifications;
using MazadZone.Domain.Repositories;

namespace MazadZone.Application.Features.Notifications.Commands.MarkAsRead;

public class MarkAsReadHandler : ICommandHandler<MarkAsReadCommand, Unit>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<MarkAsReadHandler> _logger;

    public MarkAsReadHandler(
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        ILogger<MarkAsReadHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(MarkAsReadCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Marking notification {NotificationId} as read", request.NotificationId);

        var notification = await _notificationRepository.GetByIdAsync(request.NotificationId, cancellationToken);

        if (notification is null)
        {
            _logger.LogWarning("Notification {NotificationId} not found", request.NotificationId);
            return NotificationErrors.NotFound;
        }

        notification.MarkAsRead();

        _notificationRepository.Update(notification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Notification {NotificationId} marked as read", request.NotificationId);

        return Unit.Value;
    }
}