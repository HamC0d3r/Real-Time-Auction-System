using MazadZone.Application.Common.Interfaces;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.Events;

namespace MazadZone.Application.Features.Users.Commands.ChangeEmail;

public class EmailChangedSecurityHandler : INotificationHandler<UserEmailChangedDomainEvent>
{
    private readonly IEmailService _emailService;
    private readonly INotificationRepository _notificationRepo;

    public EmailChangedSecurityHandler(
        IEmailService emailService,
        INotificationRepository notificationRepo
    )
    {
        _emailService = emailService;
        _notificationRepo = notificationRepo;
    }

    public async Task Handle(UserEmailChangedDomainEvent notification, CancellationToken ct)
    {
        const string title = "Security Alert: Email Updated";
        
        // 1. Internal Notification (In-App)
        // We notify the User ID directly in the database
        await _notificationRepo.NotifyUserAsync(
            notification.UserId,
            title,
            $"The email associated with your account was changed from {notification.OldEmail} to {notification.NewEmail}.",
             ct);

        // 2. External Email (OLD Address - Crucial for anti-theft)
        await _emailService.SendEmailAsync(new EmailRequest(
            To: notification.OldEmail,
            Subject: "⚠️ Alert: Your MazadZone email was changed",
            Body: "If you did not authorize this change, please lock your account immediately."
        ), ct);

        // 3. External Email (NEW Address - Confirmation)
        await _emailService.SendEmailAsync(new EmailRequest(
            To: notification.NewEmail,
            Subject: "Confirmation: New Email Address",
            Body: "You have successfully updated your email. Use this address for all future logins."
        ), ct);
    }
}