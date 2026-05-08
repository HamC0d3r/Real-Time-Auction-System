using MazadZone.Application.Common.Interfaces;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.Events;

namespace MazadZone.Application.Features.Users.Commands.Activate;

public class UserActivatedHandler: INotificationHandler<UserActivatedDomainEvent>
{
    private readonly IEmailService emailService;
    private readonly INotificationRepository notificationRepo;

    public UserActivatedHandler(IEmailService emailService, INotificationRepository notificationRepo)
    {
        this.emailService = emailService;
        this.notificationRepo = notificationRepo;
    }

    public async Task Handle(UserActivatedDomainEvent notification, CancellationToken ct)
    {
        const string title = "Welcome Back! Account Activated";
        const string message = "Your account suspension has been lifted. You can now participate in auctions again.";

        // 1. In-App Notification
        await notificationRepo.NotifyUserAsync(notification.UserId, title, message, ct);

        // 2. Email Notification
        await emailService.SendEmailAsync(new EmailRequest(
            To: notification.Email,
            Subject: title,
            Body: $"Hello! {message} Please note that any auctions cancelled during your suspension will not be automatically restarted."
        ), ct);
    }
}