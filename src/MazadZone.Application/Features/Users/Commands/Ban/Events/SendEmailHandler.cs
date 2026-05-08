using MazadZone.Application.Common.Interfaces;
using MazadZone.Domain.Users.Events;

namespace MazadZone.Application.Features.Users.Commands.Ban.Events;
public class SendEmailHandler(IEmailService emailService) : INotificationHandler<UserBannedDomainEvent>
{
    public async Task Handle(UserBannedDomainEvent notification, CancellationToken ct)
    {
        var request = new EmailRequest(
            To: notification.Email,
            Subject: "Account Terminated: MazadZone",
            Body: $"Your account has been permanently banned for the following reason: {notification.Reason}",
            IsHtml: false
        );

        await emailService.SendEmailAsync(request, ct);
    }
}