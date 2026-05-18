using MazadZone.Application.Features.Orders.Commands.OpenDispute;
using MazadZone.Domain.Orders;
using MediatR;

namespace Tests.Application.Features.Orders.Commands.OpenDispute;

public class OpenDisputeCommandHandlerTests : OrderBaseTest<OpenDisputeCommandHandler>
{
    [Fact]
    public async Task Handle_OrderDoesNotExist_ReturnsNotFoundError()
    {
        // Arrange
        var command = OrderHelper.CreateOpenDisputeCommand();

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
    public async Task Handle_DisputeCannotBeOpened_ReturnsDomainError()
    {
        // 1. Arrange - Create an order in a state where a dispute isn't allowed yet
        // (Assuming you can't dispute a 'Pending' order - it must be 'Shipped' or 'Delivered')
        var order = OrderHelper.CreatePendingOrder();

        var command = OrderHelper.CreateOpenDisputeCommand() with { OrderId = order.Id };

        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ValidCommand_OpensDisputeAndSavesChanges()
    {
        // 1. Arrange - Prepare an order in a valid state for a dispute
        var order = OrderHelper.CreateShippedOrder();

        var command = OrderHelper.CreateOpenDisputeCommand() with { OrderId = order.Id };

        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(Unit.Value);

        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

}