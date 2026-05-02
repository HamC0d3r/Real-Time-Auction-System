using Microsoft.Extensions.Logging;
using MazadZone.Domain.Notifications;
using MazadZone.Domain.Repositories;

namespace MazadZone.Application.Features.Notifications.Commands.DeleteNotification;

public class DeleteNotificationHandler : ICommandHandler<DeleteNotificationCommand, Unit>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<DeleteNotificationHandler> _logger;

    public DeleteNotificationHandler(
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        ILogger<DeleteNotificationHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(DeleteNotificationCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Deleting notification {NotificationId}", request.NotificationId);

        var notification = await _notificationRepository.GetByIdAsync(request.NotificationId, cancellationToken);

        if (notification is null)
        {
            _logger.LogWarning("Notification {NotificationId} not found", request.NotificationId);
            return NotificationErrors.NotFound;
        }

        if (notification.IsDeleted)
        {
            _logger.LogWarning("Notification {NotificationId} is already deleted", request.NotificationId);
            return NotificationErrors.AlreadyDeleted;
        }

        notification.Delete();

        _notificationRepository.Update(notification);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Notification {NotificationId} deleted", request.NotificationId);

        return Unit.Value;
    }
}