using MazadZone.Application.Features.Orders.Commands.OpenDispute;

namespace Tests.Application.Features.Orders.Events;

public class AlertAdminOnDisputeOpenedDomainEventHandlerTests : OrderBaseTest<AlertAdminOnDisputeOpenedDomainEventHandler>
{
    [Fact]
    public async Task Handle_DisputeOpened_SendsNotificationToAdmin()
    {
        // Arrange
        var domainEvent = OrderHelper.CreateDisputeOpenedEvent();

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        await _notificationRepository.Received(1).NotifyAdminAsync(
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
    }
}