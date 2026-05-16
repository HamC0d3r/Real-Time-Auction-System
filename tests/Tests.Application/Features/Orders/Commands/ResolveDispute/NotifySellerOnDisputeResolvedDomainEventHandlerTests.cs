using MazadZone.Application.Features.Orders.Commands.ResolveDispute;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Sellers;
using MazadZone.Domain.Shared.ValueObjects;

namespace Tests.Application.Features.Orders.Commands.ResolveDispute;

public class NotifySellerOnDisputeResolvedDomainEventHandlerTests 
    : OrderBaseTest<NotifySellerOnDisputeResolvedDomainEventHandler>
{
    // [Fact]
    // public async Task Handle_Should_ReturnEarly_When_SellerIsNotFound()
    // {
    //     // Arrange
    //     var auctionId = AuctionId.New();
    //     var domainEvent = new DisputeResolvedDomainEvent(
    //         OrderId.New(), 
    //         auctionId, 
    //         DisputeId.New(), 
    //         "Resolved");

    //     // ✅ Vogen-Safe Stub: Use ReturnsForAnyArgs so NSubstitute doesn't evaluate the AuctionId wrapper during setup
    //     _sellerRepository.GetByAuctionIdAsync(default!, default)
    //         .ReturnsForAnyArgs((Seller?)null);

    //     // Act
    //     await Handler.Handle(domainEvent, default);

    //     // Assert
    //     // ✅ Vogen-Safe Verification: Match by underlying Guid value
    //     await _sellerRepository.Received(1).GetByAuctionIdAsync(
    //         Arg.Is<AuctionId>(id => id.Value == auctionId.Value), 
    //         Arg.Any<CancellationToken>());

    //     await _notificationRepository.DidNotReceiveWithAnyArgs().NotifySellerAsync(
    //         default!, default!, default!, default);
    // }

    // [Fact]
    // public async Task Handle_Should_NotifySeller_When_DataIsValid()
    // {
    //     // Arrange
    //     var order = CreateValidOrder();
    //     var seller = CreateValidSeller();
    //     var resolution = "No violation found. Funds released to seller.";
    //     var domainEvent = new DisputeResolvedDomainEvent(
    //         order.Id, 
    //         order.AuctionId, 
    //         DisputeId.New(), 
    //         resolution);

    //     // ✅ Vogen-Safe Stub: Avoid passing the live ID instance directly to prevent internal proxy equality crashes
    //     _sellerRepository.GetByAuctionIdAsync(order.AuctionId, default)
    //         .ReturnsForAnyArgs(seller);

    //     // Act
    //     await Handler.Handle(domainEvent, default);

    //     // Assert
    //     var expectedTitle = $"Dispute Resolution Reached: Order #{order.Id.Value}";

    //     await _sellerRepository.Received(1).GetByAuctionIdAsync(
    //         Arg.Is<AuctionId>(id => id.Value == order.AuctionId.Value), 
    //         Arg.Any<CancellationToken>());

    //     await _notificationRepository.Received(1).NotifySellerAsync(
    //         Arg.Is<Guid>(id => id == seller.Id.Value),
    //         Arg.Is<string>(t => t == expectedTitle),
    //         Arg.Is<string>(m => m.Contains(resolution) && m.Contains("check your dashboard")),
    //         Arg.Any<CancellationToken>());
    // }

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

    private static Seller CreateValidSeller() 
    {
        return Seller.BecomeSeller(
            BidderId.New(), 
            "Bank Account Number Tests", 
            "National Id Tests").Value;
    }
}