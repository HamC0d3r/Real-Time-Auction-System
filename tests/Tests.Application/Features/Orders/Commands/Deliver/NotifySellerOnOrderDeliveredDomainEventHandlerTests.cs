using MazadZone.Application.Features.Orders.Commands.Deliver;
using MazadZone.Domain.Sellers;
using Tests.Application.Features.Sellers;

namespace Tests.Application.Features.Orders.Commands.Deliver;

public class NotifySellerOnOrderDeliveredDomainEventHandlerTests : OrderBaseTest<NotifySellerOnOrderDeliveredDomainEventHandler>
{
    [Fact]
    public async Task Handle_SellerNotFound_SkipsNotification()
    {
        // Arrange
        var domainEvent = OrderHelper.CreateOrderDeliveredEvent();

        _sellerRepository.GetByAuctionIdAsync(domainEvent.AuctionId, Arg.Any<CancellationToken>())
            .Returns((Seller?)null);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        // Ensure no notification is attempted if we can't find the seller
        await _notificationRepository.DidNotReceiveWithAnyArgs()
            .NotifySellerAsync(default!, default!, default!, default);
    }

    [Fact]
    public async Task Handle_SellerFound_SendsNotification()
    {
        // Arrange
        var domainEvent = OrderHelper.CreateOrderDeliveredEvent();

        var seller = SellerHelper.CreateValidSeller();

        _sellerRepository.GetByAuctionIdAsync(domainEvent.AuctionId, Arg.Any<CancellationToken>())
            .Returns(seller);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        // We verify the notification is sent to the correct SellerId
        await _notificationRepository.Received(1).NotifySellerAsync(
            seller.Id.Value,
            Arg.Any<string>(),
            Arg.Any<string>(), 
            Arg.Any<CancellationToken>());
    }
}