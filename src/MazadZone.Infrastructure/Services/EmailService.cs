using MazadZone.Application.Common.Interfaces;

namespace MazadZone.Infrastructure.Services;

public class EmailService : IEmailService
{
    public Task SendEmailAsync(EmailRequest request, CancellationToken ct = default)
    {
        throw new NotImplementedException();
    }
}