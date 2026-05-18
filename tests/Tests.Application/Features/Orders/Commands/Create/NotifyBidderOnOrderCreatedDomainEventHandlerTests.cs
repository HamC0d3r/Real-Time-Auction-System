using MazadZone.Application.Features.Orders.Commands.Create;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;

namespace Tests.Application.Features.Orders.Events;

public class NotifyBidderOnOrderCreatedDomainEventHandlerTests : OrderBaseTest<NotifyBidderOnOrderCreatedDomainEventHandler>
{
    [Fact]
    public async Task Handle_OrderCreated_SendsNotificationToBidder()
    {
        // Arrange
        var domainEvent = new OrderCreatedDomainEvent(
            OrderId.New(),
            BidderId.New());

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        await _notificationRepository.Received(1).NotifyBidderAsync(
            domainEvent.BidderId.Value,
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
    }
}