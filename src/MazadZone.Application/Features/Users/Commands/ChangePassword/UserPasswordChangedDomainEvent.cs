using MazadZone.Application.Common.Interfaces;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.Events;

namespace MazadZone.Application.Features.Users.Commands.ChangePassword;
public class PasswordChangedSecurityHandler: INotificationHandler<UserPasswordChangedDomainEvent>
{
    private readonly IEmailService _emailService;
    private readonly INotificationRepository _notificationRepo;

    public PasswordChangedSecurityHandler(IEmailService emailService, INotificationRepository notificationRepo)
    {
        _emailService = emailService;
        _notificationRepo = notificationRepo;
    }

    public async Task Handle(UserPasswordChangedDomainEvent notification, CancellationToken ct)
    {
        const string title = "Security Update: Password Changed";

        // 1. Internal Notification
        await _notificationRepo.NotifyUserAsync(
            notification.UserId,
            title,
            "Your account password was successfully updated.",
            ct);

        // 2. External Email
        await _emailService.SendEmailAsync(new EmailRequest(
            To: notification.CurrentEmail,
            Subject: title,
            Body: "The password for your account was recently changed. If this wasn't you, reset it immediately."
        ), ct);
    }
}