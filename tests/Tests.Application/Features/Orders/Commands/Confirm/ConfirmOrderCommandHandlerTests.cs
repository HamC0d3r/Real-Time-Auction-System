using MazadZone.Application.Features.Orders.Commands.Confirm;
using MazadZone.Application.Features.Payments.Commands.CaptureRemainingAmount;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Primitives.Results;
using MazadZone.Domain.Shared.ValueObjects;
using MediatR;

namespace Tests.Application.Features.Orders.Commands.Confirm;

public class ConfirmOrderCommandHandlerTests : OrderBaseTest<ConfirmOrderCommandHandler>
{
    private readonly ISender _sender;

    public ConfirmOrderCommandHandlerTests()
    {
        // Extract the mocked MediatR sender instance from the AutoMocker container
        _sender = AutoMocker.GetSubstituteFor<ISender>();
    }

    [Fact]
    public async Task Handle_Should_ReturnNotFound_When_OrderDoesNotExist()
    {
        // Arrange
        var command = new ConfirmOrderCommand(OrderId.New());
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns((Order?)null);

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.NotFound);
        
        // Verify payment logic was completely bypassed
        await _sender.DidNotReceive().Send(Arg.Any<CaptureRemainingAmountCommand>(), Arg.Any<CancellationToken>());
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnPaymentError_When_CaptureRemainingAmountFails()
    {
        // Arrange
        var order = CreateValidOrder(); 
        var command = new ConfirmOrderCommand(order.Id);
        var paymentError =  Error.Failure("Payment.CaptureFailed", "Insufficient funds to capture remaining balance.");

        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Mock MediatR sub-command payment failure
        _sender.Send(Arg.Any<CaptureRemainingAmountCommand>(), Arg.Any<CancellationToken>())
            .Returns(Result.Failure<Unit>(paymentError));

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(paymentError);

        // Verify that aggregate confirmation state change and persistence were blocked
        order.Status.ShouldBe(OrderStatus.Pending); 
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnDomainError_When_ConfirmFails()
    {
        // Arrange - Create a fresh order and force an invalid status transition
        var order = CreateValidOrder(); 
        order.Cancel(); // Cancelled orders cannot transition to Confirmed
        
        var command = new ConfirmOrderCommand(order.Id);
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Mock payment success so it reaches the domain logic step
        _sender.Send(Arg.Any<CaptureRemainingAmountCommand>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(Unit.Value));

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.CannotConfirm);
        
        await _unitOfWork.DidNotReceive().SaveChangesAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnSuccess_When_PaymentSucceeds_And_OrderIsConfirmed()
    {
        // Arrange
        var order = CreateValidOrder(); 
        var command = new ConfirmOrderCommand(order.Id);
        
        _orderRepository.GetByIdAsync(command.OrderId.Value, Arg.Any<CancellationToken>())
            .Returns(order);

        // Mock successful balance capture
        _sender.Send(Arg.Any<CaptureRemainingAmountCommand>(), Arg.Any<CancellationToken>())
            .Returns(Result.Success(Unit.Value));

        // Act
        var result = await Handler.Handle(command, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(Unit.Value);
        
        // Assert state mutation actually executed on aggregate root
        order.Status.ShouldBe(OrderStatus.Confirmed);
        
        // Verify sub-command call correctness with value matching
        await _sender.Received(1).Send(
            Arg.Is<CaptureRemainingAmountCommand>(c => c.OrderId.Value == command.OrderId.Value), 
            Arg.Any<CancellationToken>());

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
            150.00m,
            "txn_deposit_123"
        ).Value;
    }
}