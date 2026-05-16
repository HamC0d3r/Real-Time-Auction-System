using MazadZone.Application.Features.Orders.Commands.Ship;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;

namespace Tests.Application.Features.Orders.Commands.Ship;

public class NotifyBidderOnOrderShippedDomainEventHandlerTests 
    : OrderBaseTest<NotifyBidderOnOrderShippedDomainEventHandler>
{
    [Fact]
    public async Task Handle_Should_NotifyBidder_With_CorrectMessage_When_OrderShipped()
    {
        // 1. Arrange - Use REAL IDs to avoid the Vogen 'default' crash
        var orderId = OrderId.New();
        var bidderId = BidderId.New();
        var domainEvent = new OrderShippedDomainEvent(orderId, bidderId);

        // 2. Act - Pass 'default' for CancellationToken (never use Arg.Any here!)
        await Handler.Handle(domainEvent, default);

        // 3. Assert
        // ✅ Rule: Use the actual GUID values for the verification to avoid matchers 
        // that trigger [UNINITIALIZED] errors.
        await _notificationRepository.Received(1).NotifyBidderAsync(
            Arg.Is<Guid>(id => id == bidderId.Value),
            Arg.Is<string>(t => t.Contains("Your Order is on the Way!")),
            Arg.Is<string>(m => m.Contains(orderId.Value.ToString()) && m.Contains("track your package")),
            Arg.Any<CancellationToken>());
    }
}