using MazadZone.Application.Features.Orders.Commands.AddFeedback;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Sellers;
using MazadZone.Domain.Users.ValueObjects;

namespace Tests.Application.Features.Orders.Events;

public class NotifySellerOnFeedbackLeftDomainEventHandlerTests : OrderBaseTest<NotifySellerOnFeedbackLeftDomainEventHandler>
{
    [Fact]
    public async Task Handle_Should_SendNotification_When_SellerIsFound()
    {
        // Arrange
        var domainEvent = new FeedbackLeftDomainEvent(
            OrderId.New(), 
            AuctionId.New(), 
            5, 
            "Great seller!");

        var expectedSeller = CreateValidSeller();

        _sellerRepository.GetByAuctionIdAsync(domainEvent.AuctionId, Arg.Any<CancellationToken>())
            .Returns(expectedSeller);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        // Verify the notification service was called exactly once with the exact mapped parameters
        await _notificationRepository.Received(1).NotifySellerAsync(
            expectedSeller.Id.Value,
            "New Feedback Received",
            $"You received a {domainEvent.Rating}-star review!",
            Arg.Any<CancellationToken>()
        );
    }

    [Fact]
    public async Task Handle_Should_ReturnEarly_When_SellerIsNotFound()
    {
        // Arrange
        var domainEvent = new FeedbackLeftDomainEvent(
            OrderId.New(), 
            AuctionId.New(), 
            5, 
            "Great seller!");

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

    // --- Helper Methods ---

    /// <summary>
    /// Centralizes the creation of a valid dummy Seller for testing purposes.
    /// </summary>
    private static Seller CreateValidSeller()
    {
        // Assuming your Seller aggregate requires an ID and maybe a UserID
        return Seller.BecomeSeller(BidderId.New(), "Tests Bank Acoount", "Test National Id").Value; 
    }
}