using MazadZone.Application.Features.Orders.Commands.ShipOrder;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Shared.ValueObjects;
using MediatR;

namespace Tests.Application.Features.Orders.Commands.Ship;

public class ShipOrderHandlerTests : OrderBaseTest<ShipOrderHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnNotFound_When_OrderDoesNotExist()
    {
        // Arrange
        var command = new ShipOrderCommand(OrderId.New());
        
        // ✅ Use ReturnsForAnyArgs to avoid Vogen default crashes 
        // during the repository setup.
        _orderRepository.GetByIdAsync(default!, default)
            .ReturnsForAnyArgs((Order?)null);

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
        var order = CreateValidOrder();
        order.Confirm();
        order.Ship(); // Now it's already shipped

        var command = new ShipOrderCommand(order.Id);
        
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
        var order = CreateValidOrder();
        order.Confirm(); 

        var command = new ShipOrderCommand(order.Id);
        
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

    // --- Helper ---
    private static Order CreateValidOrder()
    {
        return Order.Create(
            AuctionId.New(),
            BidderId.New(),
            BidId.New(),
            new Address("Street", "Ma'an", "111", "Jordan"),
            100.00m,
            "txn_capture_555"
        ).Value;
    }
}