using MazadZone.Application.Features.Sellers.Commands.UpdateBankDetails;
using MazadZone.Domain.Sellers;
using MediatR;

namespace Tests.Application.Features.Sellers.Commands.UpdateBankDetails;

public class UpdateBankDetailsCommandHandlerTests : SellerBaseTest<UpdateBankDetailsCommandHandler>
{
    [Fact]
    public async Task Handle_SellerDoesNotExist_ReturnsNotFoundError()
    {
        // Arrange
        var command = SellerHelper.CreateUpdateBankDetailsCommand();

        _sellerRepository.GetByIdAsync(command.SellerId.Value, Arg.Any<CancellationToken>())
            .Returns((Seller?)null);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(SellerErrors.NotFound);

        // Ensure transaction saves were safely aborted
        await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(default);
    }

    [Fact]
    public async Task Handle_NewAccountNumberIsInvalid_ReturnsDomainError()
    {
        // Arrange
        var seller = SellerHelper.CreateValidSeller();

        // Passing an empty string to violate internal entity domain invariants
        var command = SellerHelper.CreateUpdateBankDetailsCommand() with { NewAccountNumber = string.Empty };

        _sellerRepository.GetByIdAsync(command.SellerId.Value, Arg.Any<CancellationToken>())
            .Returns(seller);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.Code.ShouldNotBe(SellerErrors.NotFound.Code); // Failure from domain rule, not mapping

        // Verify that no uncommitted changes are flushed to the DB
        _sellerRepository.DidNotReceive().Update(Arg.Any<Seller>());
        await _unitOfWork.DidNotReceiveWithAnyArgs().SaveChangesAsync(default);
    }

    [Fact]
    public async Task Handle_ValidCommand_UpdatesBankDetailsAndSavesChanges()
    {
        // Arrange
        var seller = SellerHelper.CreateValidSeller();
        var command = SellerHelper.CreateUpdateBankDetailsCommand() with { SellerId = seller.Id };

        _sellerRepository.GetByIdAsync(command.SellerId.Value, Arg.Any<CancellationToken>())
            .Returns(seller);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(Unit.Value);

        // Verify internal aggregate tracking mutations occurred correctly
        seller.BankAccountNumber.ShouldBe(command.NewAccountNumber);

        // Verify infrastructure triggers were dispatched perfectly
        _sellerRepository.Received(1).Update(Arg.Is<Seller>(s => s.Id.Value == seller.Id.Value));
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}