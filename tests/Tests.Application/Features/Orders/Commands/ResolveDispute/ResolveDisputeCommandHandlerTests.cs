using MazadZone.Application.Features.Orders.Commands.ResolveDispute;
using MazadZone.Domain.Orders;
using MediatR;

namespace Tests.Application.Features.Orders.Commands.ResolveDispute;

public class ResolveDisputeCommandHandlerTests : OrderBaseTest<ResolveDisputeCommandHandler>
{
    [Fact]
    public async Task Handle_OrderDoesNotExist_ReturnsNotFoundError()
    {
        // Arrange
        var command = OrderHelper.CreateResolveDisputeCommand();

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
    public async Task Handle_OrderIsNotInDispute_ReturnsDomainError()
    {
        // Arrange - Create a fresh order (Status: Pending)
        var order = OrderHelper.CreatePendingOrder();
        var command = OrderHelper.CreateResolveDisputeCommand() with { OrderId = order.Id };

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
    public async Task Handle_ValidCommand_ResolvesDisputeAndSavesChanges()
    {
        // Arrange - Move order to 'Disputed' state so it can be resolved
        var order = OrderHelper.CreateShippedOrder();
        order.OpenDispute("Item was damaged."); // Transition to Disputed

        var command = OrderHelper.CreateResolveDisputeCommand() with { OrderId = order.Id };

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

}