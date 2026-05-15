using MazadZone.Application.Features.Orders.Commands.Create;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;

namespace Tests.Application.Features.Orders.Events;

public class NotifyBidderOnOrderCreatedDomainEventHandlerTests
{
    private readonly INotificationRepository _notificationService;
    private readonly NotifyBidderOnOrderCreatedDomainEventHandler _handler;

    public NotifyBidderOnOrderCreatedDomainEventHandlerTests()
    {
        // Arrange
        _notificationService = Substitute.For<INotificationRepository>();
        _handler = new NotifyBidderOnOrderCreatedDomainEventHandler(_notificationService);
    }

    [Fact]
    public async Task Handle_Should_NotifyBidder_With_CorrectMessage()
    {
        // Arrange
        var domainEvent = new OrderCreatedDomainEvent(
            OrderId.New(),
            BidderId.New());

        // Act
        await _handler.Handle(domainEvent, default);

        // Assert
        // We verify the call reached the service with the exact BidderId from the event
        await _notificationService.Received(1).NotifyBidderAsync(
            domainEvent.BidderId.Value,
            Arg.Is<string>(t => t == "Auction Won! Action Required"),
            Arg.Is<string>(m => m.Contains("Congratulations") && m.Contains("winning bid")),
            Arg.Any<CancellationToken>());
    }
}