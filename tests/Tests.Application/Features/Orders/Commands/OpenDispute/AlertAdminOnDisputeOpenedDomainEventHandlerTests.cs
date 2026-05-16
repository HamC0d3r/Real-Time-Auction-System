using MazadZone.Application.Features.Orders.Commands.OpenDispute;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;

namespace Tests.Application.Features.Orders.Events;

public class AlertAdminOnDisputeOpenedDomainEventHandlerTests:OrderBaseTest<AlertAdminOnDisputeOpenedDomainEventHandler>
{
    [Fact]
    public async Task Handle_Should_NotifyAdmin_With_FormattedDisputeId()
    {
        // Arrange
        var orderId = OrderId.New();
        var disputeId = DisputeId.New(); // Assuming DisputeId exists in your domain
        var domainEvent = new DisputeOpenedDomainEvent(orderId, disputeId);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        // We check that string.Format correctly injected the DisputeId into the title
        var expectedTitle = $"New Mediation Required: Dispute #{disputeId.Value}";

        await _notificationRepository.Received(1).NotifyAdminAsync(
            Arg.Is<string>(t => t == expectedTitle),
            Arg.Is<string>(m => m.Contains(orderId.Value.ToString()) && 
                                  m.Contains(disputeId.Value.ToString())),
            Arg.Any<CancellationToken>());
    }
}