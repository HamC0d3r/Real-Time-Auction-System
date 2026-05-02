using AutoMapper;
using MazadZone.Api.Contracts.Notifications;
using MazadZone.Application.Features.Notifications.Commands.CreateNotification;
using MazadZone.Application.Features.Notifications.Queries.GetNotifications;

namespace MazadZone.Application.Common.Mappings;

public class NotificationMappingProfile : Profile
{
    public NotificationMappingProfile()
    {
        CreateMap<CreateNotificationRequest, CreateNotificationCommand>();

        CreateMap<GetNotificationsRequest, GetNotificationsQuery>();
    }
}