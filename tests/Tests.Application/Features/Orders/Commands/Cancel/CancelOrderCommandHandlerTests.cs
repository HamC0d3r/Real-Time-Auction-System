using MazadZone.Application.Features.Orders.Commands.CancelOrder;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Shared.ValueObjects;
using MediatR;

namespace Tests.Application.Features.Orders.Commands.CancelOrder;

public class CancelOrderCommandHandlerTests : OrderBaseTest<CancelOrderCommandHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnNotFound_When_OrderDoesNotExist()
    {
        // Arrange
        // Note: I am assuming CancelOrderCommand takes the strongly typed OrderId
        var command = new CancelOrderCommand(OrderId.New());
        
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
    public async Task Handle_Should_ReturnDomainError_When_CancelFails()
    {
        // Arrange
        var order = CreateValidOrder(); 

        order.Confirm(); 

        var command = new CancelOrderCommand(order.Id);

        // IMPORTANT: Move the order out of the 'Pending' state to force a domain failure.
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.CannotCancel);
        
        // Verify we didn't try to save the invalid state to the database
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnSuccess_When_OrderIsCancelled()
    {
        // Arrange
        var command = new CancelOrderCommand(OrderId.New());
        
        // A fresh order is automatically in the 'Pending' state, 
        // which ALLOWS cancellation.
        var order = CreateValidOrder();

        
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