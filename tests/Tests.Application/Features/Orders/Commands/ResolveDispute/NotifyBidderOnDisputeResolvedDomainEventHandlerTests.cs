using MazadZone.Application.Features.Orders.Commands.ResolveDispute;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Commands.ResolveDispute;

public class NotifyBidderOnDisputeResolvedDomainEventHandlerTests 
    : OrderBaseTest<NotifyBidderOnDisputeResolvedDomainEventHandler>
{
    [Fact]
    public async Task Handle_OrderNotFound_SkipsNotification()
    {
        // Arrange
        var domainEvent = OrderHelper.CreateDisputeResolvedEvent();

        // Using ReturnsForAnyArgs to avoid Vogen default initialization crashes
        _orderRepository.GetByIdAsync(default!, default)
            .ReturnsForAnyArgs((Order?)null);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        // Verify we didn't try to notify anyone if the order record was missing
        await _notificationRepository.DidNotReceiveWithAnyArgs()
            .NotifyBidderAsync(default!, default!, default!);
    }

    [Fact]
    public async Task Handle_OrderFound_SendsNotificationToBidder()
    {
        // Arrange
        var order = OrderHelper.CreatePendingOrder();
        var domainEvent = OrderHelper.CreateDisputeResolvedEvent() with { OrderId = order.Id };

        _orderRepository.GetByIdAsync(order.Id.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        await _notificationRepository.Received(1).NotifyBidderAsync(
            order.BidderId.Value,
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
    }
}