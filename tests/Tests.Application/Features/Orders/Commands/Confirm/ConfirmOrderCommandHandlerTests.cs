using MazadZone.Application.Features.Orders.Commands.Confirm;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Entities.Users;
using MazadZone.Domain.Orders;
using MediatR;

namespace Tests.Application.Features.Orders.Commands.Confirm;

public class ConfirmOrderCommandHandlerTests : OrderBaseTest<ConfirmOrderCommandHandler>
{
    // Notice: NO CONSTRUCTOR NEEDED! AutoMocker handles everything behind the scenes.

    [Fact]
    public async Task Handle_Should_ReturnNotFound_When_OrderDoesNotExist()
    {
        // Arrange
        var command = new ConfirmOrderCommand(OrderId.New());
        
        // Setup the mock inherited from the AutoMocker base class
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns((Order?)null);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.NotFound);
        
        // Verify we didn't try to save anything to the database
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnDomainError_When_ConfirmFails()
    {
        // 1. Arrange - Create a fresh order
        var order = CreateValidOrder(); 
        
        // IMPORTANT: Move the order out of the 'Pending' state to force a domain failure.
        // A cancelled order cannot be confirmed.
        order.Cancel(); 
        
        // 2. Arrange - Map the exact ID to the command
        var command = new ConfirmOrderCommand(order.Id);
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.CannotConfirm);
        
        // Verify we didn't try to save the invalid state to the database
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnSuccess_When_OrderIsConfirmed()
    {
        // Arrange
        var order = CreateValidOrder(); 
        // A fresh order is naturally in the 'Pending' state, which ALLOWS confirmation.

        var command = new ConfirmOrderCommand(order.Id);
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(Unit.Value);
        
        // Verify the database transaction was committed
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    // --- Helper Methods ---

    /// <summary>
    /// Centralizes the creation of a valid order for testing purposes, 
    /// fulfilling all required Domain constraints.
    /// </summary>
    private static Order CreateValidOrder()
    {
        var address = new Address("123 Test St", "Amman", "11118", "Jordan");

        return Order.Create(
            AuctionId.New(),
            BidderId.New(),
            BidId.New(),
            address,
            150.00m,
            "txn_deposit_123"
        ).Value;
    }
}