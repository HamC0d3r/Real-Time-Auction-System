using MazadZone.Application.Features.Orders.Commands.AddFeedback;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Sellers;

namespace Tests.Application.Features.Orders.Commands.AddFeedback;

public class UpdateSellerRatingOnFeedbackLeftDomainEventHandlerTests : OrderBaseTest<UpdateSellerRatingOnFeedbackLeftDomainEventHandler>
{
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
        await Handler.Handle(domainEvent, default);

        // Assert
        // Verify we aborted before trying to update or save corrupted state
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_UpdateRatingAndSaveChanges_When_SellerIsFound()
    {
        // Arrange
        var domainEvent = new FeedbackLeftDomainEvent(
            OrderId.New(), 
            AuctionId.New(), 
            4, 
            "Good transaction.");

        var expectedSeller = CreateValidSeller();

        _sellerRepository.GetByAuctionIdAsync(domainEvent.AuctionId, Arg.Any<CancellationToken>())
            .Returns(expectedSeller);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        // Verify the database transaction was committed to save the new rating
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
        
        // Note: Because we are passing a real Seller entity, if `UpdateRating` 
        // exposes a readable property (like AverageRating or TotalReviews), 
        // you could also assert the mutation here.
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