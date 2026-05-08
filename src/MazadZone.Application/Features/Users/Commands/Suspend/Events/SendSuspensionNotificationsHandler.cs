using MazadZone.Application.Common.Interfaces;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.Events;

namespace MazadZone.Application.Features.Users.Commands.Suspend.Events;

public class SendSuspensionNotificationsHandler : INotificationHandler<UserSuspendedDomainEvent>
{
    public readonly IEmailService _emailService;
    public readonly INotificationRepository _notificationRepo;
private readonly IUserRepository _userRepository; 
    public readonly ILogger<SendSuspensionNotificationsHandler> _logger;

    public SendSuspensionNotificationsHandler(
        IEmailService emailService,
        IUserRepository userRepository,
        INotificationRepository notificationRepo,
        ILogger<SendSuspensionNotificationsHandler> logger
    )
    {
        _emailService = emailService;
        _userRepository = userRepository;
        _notificationRepo = notificationRepo;
        _logger = logger;
    }

    public async Task Handle(UserSuspendedDomainEvent notification, CancellationToken ct)
    {

        var title = "Account Suspended";
        var message = $"Your account has been suspended due to: {notification.Reason}. " +
                      $"Estimated return: {notification.ReinstatementDate?.ToShortDateString() ?? "Indefinite"}";

        // Internal Notification (Database/SignalR)
        await _notificationRepo.NotifyUserAsync(notification.UserId, title, message, ct);

        // 3. External Email using the EmailRequest abstraction
        var emailRequest = new EmailRequest(
            To: notification.Email,
            Subject: title,
            Body: message,
            IsHtml: false // Plain text for policy notices is often safer
        );

        await _emailService.SendEmailAsync(emailRequest, ct);

        //Centralized Logging
        SuspendUserLogs.LogNotificationsSent(_logger, notification.UserId);
    }
}