using MazadZone.Application.Features.Orders.Commands.DeliverOrder;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Shared.ValueObjects;
using MediatR;

namespace Tests.Application.Features.Orders.Commands.DeliverOrder;

public class DeliverOrderCommandHandlerTests : OrderBaseTest<DeliverOrderCommandHandler>
{

    [Fact]
    public async Task Handle_Should_ReturnNotFound_When_OrderDoesNotExist()
    {
        // Arrange
        var command = new DeliverOrderCommand(OrderId.New());
        
        // Using the underscored property from your latest OrderBaseTest
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
    public async Task Handle_Should_ReturnDomainError_When_DeliveryIsInvalid()
    {
        // 1. Arrange - Create a fresh order (Status: Pending)
        var order = CreateValidOrder(); 
        
        // 2. Arrange - Use the same ID for the command
        var command = new DeliverOrderCommand(order.Id);
        
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
    public async Task Handle_Should_ReturnSuccess_When_OrderIsDelivered()
    {
        // 1. Arrange - Create and prepare the order state
        var order = CreateValidOrder();
        order.Confirm();
        order.Ship(); // Move to Shipped so it can be Delivered

        var command = new DeliverOrderCommand(order.Id);
        
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

    // --- Helper Methods ---

    private static Order CreateValidOrder()
    {
        var address = new Address("123 Test St", "Amman", "11118", "Jordan");

        return Order.Create(
            AuctionId.New(),
            BidderId.New(),
            BidId.New(),
            address,
            200.00m,
            "txn_capture_456"
        ).Value;
    }
}