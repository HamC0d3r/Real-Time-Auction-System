using MazadZone.Application.Features.Orders.Commands.OpenDispute;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Entities.Users;
using MazadZone.Domain.Orders;
using MediatR;

namespace Tests.Application.Features.Orders.Commands.OpenDispute;

public class OpenDisputeCommandHandlerTests : OrderBaseTest<OpenDisputeCommandHandler>
{
    // No constructor needed - AutoMocker handles everything.

    [Fact]
    public async Task Handle_Should_ReturnNotFound_When_OrderDoesNotExist()
    {
        // Arrange
        var command = new OpenDisputeCommand(OrderId.New(), "Item never arrived");
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns((Order?)null);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.NotFound);
        
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnDomainError_When_DisputeCannotBeOpened()
    {
        // 1. Arrange - Create an order in a state where a dispute isn't allowed yet
        // (Assuming you can't dispute a 'Pending' order - it must be 'Shipped' or 'Delivered')
        var order = CreateValidOrder(); 
        
        var command = new OpenDisputeCommand(order.Id, "Reason for dispute");
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnSuccess_When_DisputeIsOpened()
    {
        // 1. Arrange - Prepare an order in a valid state for a dispute
        var order = CreateValidOrder();
        order.Confirm();
        order.Ship(); // Move to a state where the buyer might actually have a problem

        var command = new OpenDisputeCommand(order.Id, "Received wrong item");
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(Unit.Value);
        
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    // --- Helper Methods ---

    private static Order CreateValidOrder()
    {
        var address = new Address("Main St", "Amman", "11118", "Jordan");

        // Using proper factory methods to avoid VOG009 (default prohibited)
        return Order.Create(
            AuctionId.New(),
            BidderId.New(),
            BidId.New(),
            address,
            300.00m,
            "txn_capture_789"
        ).Value;
    }
}