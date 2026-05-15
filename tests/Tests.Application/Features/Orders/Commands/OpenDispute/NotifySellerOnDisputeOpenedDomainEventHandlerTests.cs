using MazadZone.Application.Features.Orders.Commands.OpenDispute;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Entities.Users;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Sellers;

namespace Tests.Application.Features.Orders.Events;

public class NotifySellerOnDisputeOpenedDomainEventHandlerTests :OrderBaseTest<NotifySellerOnDisputeOpenedDomainEventHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnEarly_When_OrderIsNotFound()
    {
        // Arrange
        var domainEvent = new DisputeOpenedDomainEvent(OrderId.New(), DisputeId.New());
        
        _orderRepository.GetByIdAsync(domainEvent.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns((Order?)null);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        await _sellerRepository.DidNotReceive().GetByAuctionIdAsync(AuctionId.Empty, default);
        await _notificationRepository.DidNotReceive().NotifySellerAsync(Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<string>(), default);
    }

    [Fact]
    public async Task Handle_Should_ReturnEarly_When_SellerIsNotFound()
    {
        // Arrange
        var domainEvent = new DisputeOpenedDomainEvent(OrderId.New(), DisputeId.New());
        var order = CreateValidOrder();

        _orderRepository.GetByIdAsync(domainEvent.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        _sellerRepository.GetByAuctionIdAsync(order.AuctionId, Arg.Any<CancellationToken>())
            .Returns((Seller?)null);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        // Verify we checked the order but stopped because the seller was missing
        await _orderRepository.Received(1).GetByIdAsync(domainEvent.OrderId.Value, Arg.Any<CancellationToken>());
        await _notificationRepository.DidNotReceiveWithAnyArgs().NotifySellerAsync(default!, default!, default!, default);
    }

    [Fact]
    public async Task Handle_Should_NotifySeller_When_Valid()
    {
        // Arrange

        var order = CreateValidOrder();
        var seller = CreateValidSeller();
        var domainEvent = new DisputeOpenedDomainEvent(order.Id, DisputeId.New());

        _orderRepository.GetByIdAsync(domainEvent.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        _sellerRepository.GetByAuctionIdAsync(order.AuctionId, Arg.Any<CancellationToken>())
            .ReturnsForAnyArgs(seller);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        var expectedTitle = $"Urgent: Dispute Opened for Order #{order.Id.Value}";

        await _notificationRepository.Received(1).NotifySellerAsync(
            seller.Id.Value,
            Arg.Is<string>(t => t == expectedTitle),
            Arg.Is<string>(m => m.Contains(order.Id.Value.ToString()) && m.Contains("temporarily placed on hold")),
            Arg.Any<CancellationToken>());
    }

    // --- Helpers ---

    private static Order CreateValidOrder()
    {
        return Order.Create(
             AuctionId.New(),
            BidderId.New(),
            BidId.New(),
            new Address("St", "City", "Zip", "Country"),
            100m,
            "txn_123").Value;
    }

    private static Seller CreateValidSeller() => Seller.BecomeSeller(BidderId.New(), "Testing Banck Account Number", "Testing National Id").Value;
}