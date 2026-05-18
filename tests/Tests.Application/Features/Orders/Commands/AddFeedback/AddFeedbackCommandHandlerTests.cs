using MazadZone.Application.Features.Orders.Commands.AddFeedback;
using MazadZone.Domain.Orders;
using MediatR;

namespace Tests.Application.Features.Orders.Commands.AddFeedback;

public class AddFeedbackCommandHandlerTests : OrderBaseTest<AddFeedbackCommandHandler>
{
    [Fact]
    public async Task Handle_OrderDoesNotExist_ReturnsNotFoundError()
    {
        // Arrange
        var command = OrderHelper.CreateAddFeedbackCommand();
        
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
    public async Task Handle_OrderIsNotDelivered_ReturnsDomainError()
    {
        // Arrange
        var command = OrderHelper.CreateAddFeedbackCommand();
        
        var order = OrderHelper.CreatePendingOrder(); 
        
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
    public async Task Handle_ValidCommand_AddsFeedbackAndSavesChanges()
    {
        // Arrange
        var command = OrderHelper.CreateAddFeedbackCommand();
        
        var order = OrderHelper.CreateDeliveredOrder(); 
        
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
}