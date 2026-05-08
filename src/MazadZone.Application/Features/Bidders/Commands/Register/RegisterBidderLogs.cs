namespace MazadZone.Application.Features.Bidders.Commands.Register;

public static partial class RegisterBidderLogs
{
    [LoggerMessage(
        Level = LogLevel.Information,
        EventId = MazadLogEvents.Bidders.Registered,
        Message = "Registration completed successfully. UserId: {UserId}, Email: {Email}.")]
    public static partial void LogRegistrationSuccess(this ILogger logger, Guid userId, string email);
    
    [LoggerMessage(
        Level = LogLevel.Error,
        EventId = MazadLogEvents.Bidders.ProfileError,
        Message = "Failed to create bidder profile for UserId: {UserId}. Error: {Error}")]
    public static partial void LogBidderProfileError(this ILogger logger, Guid userId, string error);
}