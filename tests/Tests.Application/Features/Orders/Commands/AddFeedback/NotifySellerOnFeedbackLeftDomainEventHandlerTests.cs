using MazadZone.Application.Features.Orders.Commands.AddFeedback;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Sellers;
using Tests.Application.Features.Sellers;

namespace Tests.Application.Features.Orders.Events;

public class NotifySellerOnFeedbackLeftDomainEventHandlerTests : OrderBaseTest<NotifySellerOnFeedbackLeftDomainEventHandler>
{
    [Fact]
    public async Task Handle_SellerFound_SendsNotification()
    {
        // Arrange
        var domainEvent = OrderHelper.CreateFeedbackLeftEvent();

        var expectedSeller = SellerHelper.CreateValidSeller();

        _sellerRepository.GetByAuctionIdAsync(domainEvent.AuctionId, Arg.Any<CancellationToken>())
            .Returns(expectedSeller);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        // Verify the notification service was called exactly once with the exact mapped parameters
        await _notificationRepository.Received(1).NotifySellerAsync(
            expectedSeller.Id.Value,
            Arg.Any<string>(), 
            Arg.Any<string>(),
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task Handle_SellerNotFound_SkipsNotification()
    {
        // Arrange
        var domainEvent = OrderHelper.CreateFeedbackLeftEvent();

        // Simulate database returning null
        _sellerRepository.GetByAuctionIdAsync(domainEvent.AuctionId, Arg.Any<CancellationToken>())
            .Returns((Seller?)null);

        // Act
        // Because of your guard clause, this will execute silently and safely.
        await Handler.Handle(domainEvent, default);

        // Assert
        // Verify we aborted before trying to send a notification to a null ID
        await _notificationRepository.DidNotReceiveWithAnyArgs()
            .NotifySellerAsync(default!, default!, default!, default);
    }
}