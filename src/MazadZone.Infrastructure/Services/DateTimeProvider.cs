using MazadZone.Application.Services;

namespace MazadZone.Infrastructure.Services;

public class DateTimeProvider : IDateTimeProvider
{
    public DateTime Now => DateTime.UtcNow;
}