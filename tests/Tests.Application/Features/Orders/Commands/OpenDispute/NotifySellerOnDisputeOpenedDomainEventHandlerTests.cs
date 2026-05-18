using MazadZone.Application.Features.Orders.Commands.OpenDispute;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Sellers;
using Tests.Application.Features.Sellers;

namespace Tests.Application.Features.Orders.Events;

public class NotifySellerOnDisputeOpenedDomainEventHandlerTests : OrderBaseTest<NotifySellerOnDisputeOpenedDomainEventHandler>
{
    [Fact]
    public async Task Handle_OrderNotFound_SkipsNotification()
    {
        // Arrange
        var domainEvent = OrderHelper.CreateDisputeOpenedEvent();

        _orderRepository.GetByIdAsync(domainEvent.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns((Order?)null);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        await _sellerRepository.DidNotReceive().GetByAuctionIdAsync(AuctionId.Empty, default);
        await _notificationRepository.DidNotReceive().NotifySellerAsync(Arg.Any<Guid>(), Arg.Any<string>(), Arg.Any<string>(), default);
    }

    [Fact]
    public async Task Handle_SellerNotFound_SkipsNotification()
    {
        // Arrange
        var domainEvent = OrderHelper.CreateDisputeOpenedEvent();
        var order = OrderHelper.CreatePendingOrder();

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
    public async Task Handle_ValidEvent_SendsNotificationToSeller()
    {
        // Arrange

        var order = OrderHelper.CreatePendingOrder();
        var seller = SellerHelper.CreateValidSeller();

        var domainEvent = OrderHelper.CreateDisputeOpenedEvent();

        _orderRepository.GetByIdAsync(domainEvent.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        _sellerRepository.GetByAuctionIdAsync(order.AuctionId, Arg.Any<CancellationToken>())
            .ReturnsForAnyArgs(seller);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        await _notificationRepository.Received(1).NotifySellerAsync(
            seller.Id.Value,
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>());
    }

}