using MazadZone.Application.Features.Bidders.DTOs;
using MazadZone.Application.Features.Orders.Commands.Create;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Commands.Create;

public class CreateOrderCommandHandlerTests : OrderBaseTest<CreateOrderCommandHandler>
{
    // NO CONSTRUCTOR NEEDED! AutoMocker handles the wiring.

    [Fact]
    public async Task Handle_Should_ReturnDomainError_When_OrderCreationFails()
    {
        // Arrange
        // Passing an invalid amount (e.g., negative) to trigger the Domain rule inside Order.Create
        var invalidAmount = -10m; 
        var command = CreateCommandWithAmount(invalidAmount);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        
        // Asserting the exact error defined in your Domain (Order.Create)
        result.TopError.ShouldBe(OrderErrors.TotalAmountTooLow); 
        
        // Verify we blocked the corrupted state from entering the repository
        _orderRepository.DidNotReceive().Add(Arg.Any<Order>());
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnSuccessAndOrderId_When_OrderIsCreated()
    {
        // Arrange
        // Passing a valid amount to satisfy the Domain rules
        var validAmount = 150.00m;
        var command = CreateCommandWithAmount(validAmount);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        
        // Ensure an actual ID was generated and returned
        result.Value.Value.ShouldNotBe(Guid.Empty);
        
        // Verify the infrastructure was called to persist the new aggregate
        _orderRepository.Received(1).Add(Arg.Any<Order>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    // --- Helper Methods ---

    /// <summary>
    /// Centralizes the creation of the command to keep tests DRY and readable.
    /// Allows overriding specific parameters (like amount) to test boundary rules.
    /// </summary>
    private static CreateOrderCommand CreateCommandWithAmount(decimal amount)
    {
        var address = new AddressDto("123 Test St", "Amman", "11118", "Jordan");

        return new CreateOrderCommand(
            AuctionId.New(),
            BidderId.New(),
            BidId.New(),
            address, // Assuming your command accepts the Address Value Object here
            amount,
            "txn_deposit_123"
        );
    }
}