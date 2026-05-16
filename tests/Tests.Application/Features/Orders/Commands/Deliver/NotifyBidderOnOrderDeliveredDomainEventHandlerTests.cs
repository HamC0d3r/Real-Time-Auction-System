using MazadZone.Application.Features.Orders.Commands.Deliver;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;

namespace Tests.Application.Features.Orders.Commands.Deliver;

public class NotifyBidderOnOrderDeliveredDomainEventHandlerTests
{
    private readonly INotificationRepository _notificationService;
    private readonly NotifyBidderOnOrderDeliveredDomainEventHandler _handler;

    public NotifyBidderOnOrderDeliveredDomainEventHandlerTests()
    {
        // Arrange
        _notificationService = Substitute.For<INotificationRepository>();
        _handler = new NotifyBidderOnOrderDeliveredDomainEventHandler(_notificationService);
    }

    [Fact]
    public async Task Handle_Should_NotifyBidder_With_CorrectMessage()
    {
        // Arrange
        var domainEvent = new OrderDeliveredDomainEvent(
            OrderId.New(),
            AuctionId.New(),
            BidderId.New());

        const string expectedTitle = "Item Delivered! How was your experience? ⭐";

        // Act
        await _handler.Handle(domainEvent, default);

        // Assert
        // We verify that the bidder is notified and that the message contains the specific OrderId
        await _notificationService.Received(1).NotifyBidderAsync(
            domainEvent.BidderId.Value,
            expectedTitle,
            Arg.Is<string>(msg => msg.Contains(domainEvent.OrderId.Value.ToString()) && 
                                  msg.Contains("leave feedback")),
            Arg.Any<CancellationToken>());
    }
}