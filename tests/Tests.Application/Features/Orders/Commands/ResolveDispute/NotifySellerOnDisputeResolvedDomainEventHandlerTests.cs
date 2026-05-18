using MazadZone.Application.Features.Orders.Commands.ResolveDispute;
using Tests.Application.Features.Sellers;

namespace Tests.Application.Features.Orders.Commands.ResolveDispute;

public class NotifySellerOnDisputeResolvedDomainEventHandlerTests 
    : OrderBaseTest<NotifySellerOnDisputeResolvedDomainEventHandler>
{
    // [Fact]
    // public async Task Handle_ValidData_SendsNotificationToSeller()
    // {
    //     // Arrange
    //     var order = OrderHelper.CreatePendingOrder();
    //     var seller = SellerHelper.CreateValidSeller();
    //     var domainEvent = OrderHelper.CreateDisputeResolvedEvent() with { OrderId = order.Id};

    //     _sellerRepository.GetByAuctionIdAsync(order.AuctionId, default)
    //         .Returns(seller);

    //     // Act
    //     await Handler.Handle(domainEvent, default);

    //     // Assert
    //     await _sellerRepository.Received(1).GetByAuctionIdAsync(
    //         order.AuctionId, 
    //         Arg.Any<CancellationToken>());

    //     await _notificationRepository.Received(1).NotifySellerAsync(
    //         seller.Id.Value,
    //         Arg.Any<string>(),
    //         Arg.Any<string>(),
    //         Arg.Any<CancellationToken>());
    // }
}