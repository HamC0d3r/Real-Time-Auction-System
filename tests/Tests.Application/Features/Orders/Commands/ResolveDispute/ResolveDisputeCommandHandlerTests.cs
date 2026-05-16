using MazadZone.Application.Features.Orders.Commands.ResolveDispute;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Shared.ValueObjects;
using MediatR;

namespace Tests.Application.Features.Orders.Commands.ResolveDispute;

public class ResolveDisputeCommandHandlerTests : OrderBaseTest<ResolveDisputeCommandHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnNotFound_When_OrderDoesNotExist()
    {
        // Arrange
        var command = new ResolveDisputeCommand(OrderId.New(), "Partial refund to bidder.");
        
        // Use ReturnsForAnyArgs to avoid VOG009 issues with null returns
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
    public async Task Handle_Should_ReturnDomainError_When_OrderIsNotInDispute()
    {
        // Arrange - Create a fresh order (Status: Pending)
        var order = CreateValidOrder(); 
        var command = new ResolveDisputeCommand(order.Id, "Full refund.");
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        // This fails because you can't "Resolve" a dispute that was never "Opened"
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.NoDispute); 

        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnSuccess_And_ChangeStatus_When_Valid()
    {
        // Arrange - Move order to 'Disputed' state so it can be resolved
        var order = CreateValidOrder();
        order.Confirm();
        order.Ship();
        order.OpenDispute("Item was damaged."); // Transition to Disputed

        var resolution = "Admin approved partial refund.";
        var command = new ResolveDisputeCommand(order.Id, resolution);
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(Unit.Value);
        
        // Verify the status changed in the domain
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    // --- Helper Methods ---

    private static Order CreateValidOrder()
    {
        return Order.Create(
            AuctionId.New(),
            BidderId.New(),
            BidId.New(),
            new Address("Street", "Amman", "111", "Jordan"),
            500.00m,
            "txn_capture_999"
        ).Value;
    }
}