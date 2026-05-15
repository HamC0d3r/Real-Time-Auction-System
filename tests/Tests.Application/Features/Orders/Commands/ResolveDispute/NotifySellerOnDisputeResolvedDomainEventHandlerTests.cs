using MazadZone.Application.Features.Orders.Commands.ResolveDispute;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Entities.Users;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Sellers;

namespace Tests.Application.Features.Orders.Commands.ResolveDispute;

public class NotifySellerOnDisputeResolvedDomainEventHandlerTests 
    : OrderBaseTest<NotifySellerOnDisputeResolvedDomainEventHandler>
{
    // [Fact]
    // public async Task Handle_Should_ReturnEarly_When_OrderIsNotFound()
    // {
    //     // Arrange
    //     var domainEvent = new DisputeResolvedDomainEvent(OrderId.New(), DisputeId.New(), "Resolved");

    //     // ✅ Use ReturnsForAnyArgs to skip Vogen default crashes
    //     _orderRepository.GetByIdAsync(domainEvent.OrderId.Value, Arg.Any<CancellationToken>())
    //         .Returns((Order?)null);

    //     // Act
    //     await Handler.Handle(domainEvent, default);

    //     // Assert
    //     // If order is null, we shouldn't even ask for the seller
    //     await _sellerRepository.DidNotReceiveWithAnyArgs().GetByAuctionIdAsync(AuctionId.New(), Arg.Any<CancellationToken>());
    //     await _notificationRepository.DidNotReceiveWithAnyArgs().NotifySellerAsync(default!, default!, default!, default);
    // }

//     [Fact]
// public async Task Handle_Should_ReturnEarly_When_SellerIsNotFound()
// {
//     // Arrange
//     var order = CreateValidOrder();
//     var domainEvent = new DisputeResolvedDomainEvent(
//         order.Id,
//         order.AuctionId,
//         DisputeId.New(),
//         "Resolved");

//     // Setup order repository with specific matcher or concrete value
//     // _orderRepository
//     //     .GetByIdAsync(order.Id.Value, Arg.Any<CancellationToken>())
//     //     .Returns(order);

//     // // Setup seller repository - use consistent matching
//     _sellerRepository
//         .GetByAuctionIdAsync(
//             Arg.Is<AuctionId>(id => id.Value == order.AuctionId.Value), // Specific matcher
//             Arg.Any<CancellationToken>())
//         .ReturnsForAnyArgs((Seller?)null);

//     // Act
//     await Handler.Handle(domainEvent, default);

//     // Assert - use the SAME matcher pattern
//     await _sellerRepository
//         .Received(1)
//         .GetByAuctionIdAsync(
//             Arg.Is<AuctionId>(id => id.Value == order.AuctionId.Value),
//             Arg.Any<CancellationToken>());

//     await _notificationRepository
//         .DidNotReceiveWithAnyArgs()
//         .NotifySellerAsync(default!, default!, default!, default);
// }

    [Fact]
    public async Task Handle_Should_NotifySeller_When_DataIsValid()
    {
        // Arrange
        var order = CreateValidOrder();
        var seller = CreateValidSeller();
        var resolution = "No violation found. Funds released to seller.";
        var domainEvent = new DisputeResolvedDomainEvent(order.Id, order.AuctionId, DisputeId.New(), resolution);

        _orderRepository.GetByIdAsync(order.Id.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        _sellerRepository.GetByAuctionIdAsync(order.AuctionId, Arg.Any<CancellationToken>())
            .ReturnsForAnyArgs(seller);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        var expectedTitle = $"Dispute Resolution Reached: Order #{order.Id.Value}";

        await _notificationRepository.Received(1).NotifySellerAsync(
            seller.Id.Value,
            Arg.Is<string>(t => t == expectedTitle),
            Arg.Is<string>(m => m.Contains(resolution) && m.Contains("check your dashboard")),
            Arg.Any<CancellationToken>());
    }

    // --- Helpers ---
    private static Order CreateValidOrder()
    {
        return Order.Create(
            AuctionId.New(),
            BidderId.New(),
            BidId.New(),
            new Address("St", "Ma'an", "111", "Jordan"),
            200m,
            "txn_123").Value;
    }

    private static Seller CreateValidSeller() => Seller.BecomeSeller(BidderId.New(), "Bank Acocount Number Tests", "Notional Id Tests").Value;
}