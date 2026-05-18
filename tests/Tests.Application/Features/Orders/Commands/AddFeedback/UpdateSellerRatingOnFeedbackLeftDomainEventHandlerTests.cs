using MazadZone.Application.Features.Orders.Commands.AddFeedback;
using MazadZone.Domain.Sellers;
using Tests.Application.Features.Sellers;

namespace Tests.Application.Features.Orders.Commands.AddFeedback;

public class UpdateSellerRatingOnFeedbackLeftDomainEventHandlerTests : OrderBaseTest<UpdateSellerRatingOnFeedbackLeftDomainEventHandler>
{
    [Fact]
    public async Task Handle_SellerNotFound_SkipsRatingUpdate()
    {
        // Arrange
        var domainEvent = OrderHelper.CreateFeedbackLeftEvent();

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
    public async Task Handle_SellerFound_UpdatesRatingAndSavesChanges()
    {
        // Arrange
        var domainEvent = OrderHelper.CreateFeedbackLeftEvent();

        var expectedSeller = SellerHelper.CreateValidSeller();

        _sellerRepository.GetByAuctionIdAsync(domainEvent.AuctionId, Arg.Any<CancellationToken>())
            .Returns(expectedSeller);

        // Act
        await Handler.Handle(domainEvent, default);

        // Assert
        // Verify the database transaction was committed to save the new rating
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}