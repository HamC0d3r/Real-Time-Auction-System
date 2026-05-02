using Microsoft.Extensions.Logging;
using MazadZone.Domain.Notifications;
using MazadZone.Domain.Repositories;

namespace MazadZone.Application.Features.Notifications.Commands.CreateNotification;


/// <summary>/ Handler for creating a new notification.
/// </summary>
/// <remarks>
/// This handler processes the CreateNotificationCommand, which contains the necessary information to create a new notification
/// for a user. It interacts with the INotificationRepository to persist the new notification and uses IUnitOfWork to ensure that the operation is atomic.
/// </remarks>
/// <param name="request">The command containing the details of the notification to be created.</param>
/// <param name="cancellationToken">A token to monitor for cancellation requests.</param>
/// <returns>A Result containing the ID of the newly created notification if successful, or an error if the operation fails.</returns>
public class CreateNotificationHandler : ICommandHandler<CreateNotificationCommand, NotificationId>
{
    private readonly INotificationRepository _notificationRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateNotificationHandler> _logger;

    public CreateNotificationHandler(
        INotificationRepository notificationRepository,
        IUnitOfWork unitOfWork,
        ILogger<CreateNotificationHandler> logger)
    {
        _notificationRepository = notificationRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<NotificationId>> Handle(CreateNotificationCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating notification for user {UserId}", request.UserId);

        var notification = Notification.Create(request.UserId, request.Title, request.Message);

        await _notificationRepository.AddAsync(notification, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Notification created with ID {NotificationId}", notification.Id);

        return notification.Id;
    }
}