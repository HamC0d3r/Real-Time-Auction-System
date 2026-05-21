using MazadZone.Domain.Shared.Interfaces;

namespace MazadZone.Application.Services;
public interface IDateTimeProvider : IScopedService
{
    DateTime Now { get; }
}