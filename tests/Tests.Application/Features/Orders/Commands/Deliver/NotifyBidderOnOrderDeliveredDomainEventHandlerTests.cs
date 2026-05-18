using MazadZone.Application.Features.Orders.Commands.Deliver;

namespace Tests.Application.Features.Orders.Commands.Deliver;

public class NotifyBidderOnOrderDeliveredDomainEventHandlerTests : OrderBaseTest<NotifyBidderOnOrderDeliveredDomainEventHandler>
{
    [Fact]
    public async Task Handle_OrderDelivered_SendsNotificationToBidder()
    {
        // Arrange
        var domainEvent = OrderHelper.CreateOrderDeliveredEvent();

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        // We verify that the bidder is notified and that the message contains the specific OrderId
        await _notificationRepository.Received(1).NotifyBidderAsync(
            domainEvent.BidderId.Value,
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
    }
}