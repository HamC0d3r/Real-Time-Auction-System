using MazadZone.Application.Features.Orders.Commands.Create;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Commands.Create;

public class CreateOrderCommandHandlerTests : OrderBaseTest<CreateOrderCommandHandler>
{
    [Fact]
    public async Task Handle_OrderCreationFails_ReturnsDomainError()
    {
        // Arrange
        var command = OrderHelper.CreateOrderCommand() with {Amount = -10}; // Invalid amount to trigger domain error

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();

        // Asserting the exact error defined in your Domain (Order.Create)
        result.TopError.ShouldBe(OrderErrors.TotalAmountTooLow);

        // Verify we blocked the corrupted state from entering the repository
        _orderRepository.DidNotReceive().Add(Arg.Any<Order>());
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_ValidCommand_CreatesOrderAndSavesChanges()
    {
        // Arrange
        // Passing a valid amount to satisfy the Domain rules
        var command = OrderHelper.CreateOrderCommand();

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();

        // Ensure an actual ID was generated and returned
        result.Value.Value.ShouldNotBe(Guid.Empty);

        // Verify the infrastructure was called to persist the new aggregate
        _orderRepository.Received(1).Add(Arg.Any<Order>());
        await _unitOfWork.Received(1).SaveChangesAsync(Arg.Any<CancellationToken>());
    }

}