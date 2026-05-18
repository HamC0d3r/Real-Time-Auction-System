using MazadZone.Application.Features.Orders.Commands.ShipOrder;
using MazadZone.Domain.Orders;
using MediatR;

namespace Tests.Application.Features.Orders.Commands.Ship;

public class ShipOrderHandlerTests : OrderBaseTest<ShipOrderHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnNotFound_When_OrderDoesNotExist()
    {
        // Arrange
        var command = OrderHelper.CreateShipOrderCommand();
        
        // during the repository setup.
        _orderRepository.GetByIdAsync(default!, default)
            .Returns((Order?)null);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.NotFound);
        
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnDomainError_When_OrderIsAlreadyShipped()
    {
        // Arrange - Create an order and move it to Shipped status
        var order = OrderHelper.CreateShippedOrder();

        var command = OrderHelper.CreateShipOrderCommand() with { OrderId = order.Id };
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        // Assuming your Domain prevents shipping an already shipped order
        result.TopError.ShouldBe(OrderErrors.CannotShipped); 

        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnSuccess_And_Save_When_OrderIsConfirmed()
    {
        // Arrange - Order must be in 'Confirmed' state to allow shipping
        var order = OrderHelper.CreateConfirmedOrder();

        var command = OrderHelper.CreateShipOrderCommand() with { OrderId = order.Id };
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(Unit.Value);
        
        // Verify the status changed in the aggregate
        order.Status.ShouldBe(OrderStatus.Shipped);
        
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }
}