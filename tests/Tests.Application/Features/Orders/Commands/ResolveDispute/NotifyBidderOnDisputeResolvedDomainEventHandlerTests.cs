using MazadZone.Application.Features.Orders.Commands.ResolveDispute;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Entities.Users;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;

namespace Tests.Application.Features.Orders.Commands.ResolveDispute;

public class NotifyBidderOnDisputeResolvedDomainEventHandlerTests 
    : OrderBaseTest<NotifyBidderOnDisputeResolvedDomainEventHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnEarly_When_OrderIsNotFound()
    {
        // Arrange
        var domainEvent = new DisputeResolvedDomainEvent(
            OrderId.New(), 
            AuctionId.New(), 
            DisputeId.New(), 
            "The bidder was partially refunded.");

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
    public async Task Handle_Should_NotifyBidder_With_Resolution_When_OrderExists()
    {
        // Arrange
        var order = CreateValidOrder();
        var resolution = "Refund issued to bidder.";
        var domainEvent = new DisputeResolvedDomainEvent(order.Id, order.AuctionId, DisputeId.New(), resolution);

        _orderRepository.GetByIdAsync(order.Id.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        var expectedTitle = $"Dispute Resolved: Order #{order.Id.Value}";

        await _notificationRepository.Received(1).NotifyBidderAsync(
            order.BidderId.Value,
            Arg.Is<string>(t => t == expectedTitle),
            Arg.Is<string>(m => m.Contains(resolution) && m.Contains("Thank you for your patience")),
            Arg.Any<CancellationToken>());
    }

    // --- Helper ---
    private static Order CreateValidOrder()
    {
        return Order.Create(
            AuctionId.New(),
            BidderId.New(),
            BidId.New(),
            new Address("St", "City", "Zip", "Jordan"),
            150.00m,
            "txn_123").Value;
    }
}