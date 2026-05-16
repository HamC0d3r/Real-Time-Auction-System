using MazadZone.Application.Features.Orders.Commands.AddFeedback;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Shared.ValueObjects;
using MediatR;

namespace Tests.Application.Features.Orders.Commands.AddFeedback;

public class AddFeedbackCommandHandlerTests : OrderBaseTest<AddFeedbackCommandHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnNotFound_When_OrderDoesNotExist()
    {
        // Arrange
        var command = new AddFeedbackCommand(OrderId.New(), 5, "Great!");
        
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
    public async Task Handle_Should_ReturnDomainError_When_AddFeedbackFails()
    {
        // Arrange
        var command = new AddFeedbackCommand(OrderId.New(), 5, "Great!");
        
        // Create a fresh order. Fresh orders are in 'Pending' status. 
        // Adding feedback requires the 'Delivered' status, which triggers a domain error.
        var order = CreateValidOrder(); 
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.FeedbackRequiresDelivered);
        
        // Verify we didn't try to save the invalid state to the database
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnSuccess_When_FeedbackIsAdded()
    {
        // Arrange
        var command = new AddFeedbackCommand(OrderId.New(), 5, "Excellent transaction.");
        
        var order = CreateValidOrder(); 
        
        // IMPORTANT: We need the order to be in a state that ALLOWS feedback. 
        // Walk the state machine to Delivered.
        order.Confirm(); 
        order.Ship();    
        order.Deliver(); 
        
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