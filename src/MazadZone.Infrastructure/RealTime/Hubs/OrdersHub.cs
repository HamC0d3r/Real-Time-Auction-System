using Microsoft.AspNetCore.SignalR;

namespace MazadZone.Infrastructure.RealTime.Hubs;

public class OrdersHub : Hub
{
    public const string HubUrl = "/hubs/Orders";
}
