using MazadZone.Application.Features.Orders.Commands.DeliverOrder;
using MazadZone.Domain.Orders;
using MediatR;

namespace Tests.Application.Features.Orders.Commands.DeliverOrder;

public class DeliverOrderCommandHandlerTests : OrderBaseTest<DeliverOrderCommandHandler>
{
    [Fact]
    public async Task Handle_OrderDoesNotExist_ReturnsNotFoundError()
    {
        // Arrange
        var command = OrderHelper.CreateDeliverOrderCommand();
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns((Order?)null);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.NotFound);
        
        // Verify no database changes were attempted
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_DeliveryIsInvalid_ReturnsDomainError()
    {
        // 1. Arrange - Create a fresh order (Status: Pending)
        var order = OrderHelper.CreatePendingOrder();
        
        // 2. Arrange - Use the same ID for the command
        var command = OrderHelper.CreateDeliverOrderCommand() with { OrderId = order.Id };
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        // This will fail because you can't Deliver a 'Pending' order 
        // (It must be Shipped first)
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        // Adjust this to the exact error your Order.Deliver() returns for invalid states
        result.TopError.ShouldBe(OrderErrors.CannotDeliver); 

        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ValidCommand_DeliversOrderAndSavesChanges()
    {
        // 1. Arrange - Create and prepare the order state
        var order = OrderHelper.CreateShippedOrder();

        var command = OrderHelper.CreateDeliverOrderCommand() with { OrderId = order.Id };

        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(Unit.Value);
        
        // Verify the status was actually updated and saved
        order.Status.ShouldBe(OrderStatus.Delivered);
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}