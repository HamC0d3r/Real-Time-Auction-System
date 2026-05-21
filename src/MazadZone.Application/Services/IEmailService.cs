using MazadZone.Domain.Shared.Interfaces;

namespace MazadZone.Application.Common.Interfaces;

/// <summary>
/// Abstraction for sending system emails (Ban alerts, outbid notifications, etc.)
/// </summary>
public interface IEmailService : ITransientService
{
    Task SendEmailAsync(EmailRequest request, CancellationToken ct = default);
}

/// <summary>
/// Represents the data required to send an email.
/// </summary>
public record EmailRequest(
    string To, 
    string Subject, 
    string Body, 
    bool IsHtml = true);