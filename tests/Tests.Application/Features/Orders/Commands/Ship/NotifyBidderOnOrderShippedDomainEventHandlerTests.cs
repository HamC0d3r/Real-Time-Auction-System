using MazadZone.Application.Features.Orders.Commands.Ship;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;

namespace Tests.Application.Features.Orders.Commands.Ship;

public class NotifyBidderOnOrderShippedDomainEventHandlerTests 
    : OrderBaseTest<NotifyBidderOnOrderShippedDomainEventHandler>
{
    [Fact]
    public async Task Handle_OrderShipped_SendsNotificationToBidder()
    {
        var domainEvent = new OrderShippedDomainEvent(OrderId.New(), BidderId.New());

        // 2. Act - Pass 'default' for CancellationToken (never use Arg.Any here!)
        await Handler.Handle(domainEvent, default);

        // 3. Assert
        await _notificationRepository.Received(1).NotifyBidderAsync(
             domainEvent.BidderId.Value,
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
    }
}