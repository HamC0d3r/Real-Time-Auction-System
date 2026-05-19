using MazadZone.Application.Features.Sellers.Commands.Verify;
using MazadZone.Domain.Sellers;
using MediatR;

namespace Tests.Application.Features.Sellers.Commands.Verify;

public class VerifyCommandHandlerTests : SellerBaseTest<VerifyCommandHandler>
{
    [Fact]
    public async Task Handle_SellerDoesNotExist_ReturnsNotFoundError()
    {
        // Arrange
        var command = SellerHelper.CreateVerifyCommand();

        _sellerRepository.GetByIdAsync(command.SellerId.Value, Arg.Any<CancellationToken>())
            .Returns((Seller?)null);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(SellerErrors.NotFound);

        // Verify isolation: We short-circuited completely before modifying state or saving
        _sellerRepository.DidNotReceive().Update(Arg.Any<Seller>());
        await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(default);
    }

    [Fact]
    public async Task Handle_SellerExists_VerifiesSellerAndSavesChanges()
    {
        // Arrange
        var seller = SellerHelper.CreateValidSeller();
        var command = SellerHelper.CreateVerifyCommand();

        _sellerRepository.GetByIdAsync(command.SellerId.Value, Arg.Any<CancellationToken>())
            .Returns(seller);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(Unit.Value);

        // Verify internal aggregate state mutation took place
        seller.IsVerified.ShouldBeTrue();

        // Verify repository update tracking and database synchronization calls were executed
        _sellerRepository.Received(1).Update(Arg.Is<Seller>(s => s.Id.Value == seller.Id.Value));
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

}