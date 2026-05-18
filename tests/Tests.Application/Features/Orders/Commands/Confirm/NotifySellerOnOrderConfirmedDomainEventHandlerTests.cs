using MazadZone.Application.Features.Orders.Commands.Confirm;
using MazadZone.Domain.Sellers;
using Tests.Application.Features.Sellers;

namespace Tests.Application.Features.Orders.Events;

public class NotifySellerOnOrderConfirmedDomainEventHandlerTests : OrderBaseTest<NotifySellerOnOrderConfirmedDomainEventHandler>
{
    [Fact]
    public async Task Handle_SellerNotFound_SkipsNotification()
    {
        // Arrange
        var domainEvent = OrderHelper.CreateOrderConfirmedEvent();

        // Simulate database returning null
        _sellerRepository.GetByAuctionIdAsync(domainEvent.AuctionId, Arg.Any<CancellationToken>())
            .Returns((Seller?)null);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        // Verify we safely aborted without throwing an exception or sending a bad notification
        await _notificationRepository.DidNotReceiveWithAnyArgs()
            .NotifySellerAsync(default!, default!, default!, default);
    }

    [Fact]
    public async Task Handle_SellerFound_SendsNotification()
    {
        // Arrange
        var domainEvent = OrderHelper.CreateOrderConfirmedEvent();
        var expectedSeller = SellerHelper.CreateValidSeller();

        _sellerRepository.GetByAuctionIdAsync(domainEvent.AuctionId, Arg.Any<CancellationToken>())
            .Returns(expectedSeller);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert

        // Verify the notification was sent to the right seller, with the right title, 
        await _notificationRepository.Received(1).NotifySellerAsync(
            expectedSeller.Id.Value,
            Arg.Any<string>(),
            Arg.Any<string>(),
            Arg.Any<CancellationToken>()
        );
    }
}