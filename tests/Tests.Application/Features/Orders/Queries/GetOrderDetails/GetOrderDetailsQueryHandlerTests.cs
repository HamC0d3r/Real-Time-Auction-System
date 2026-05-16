using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Features.Orders.Queries.GetOrderDetails;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Queries.GetOrderDetails;

public class GetOrderDetailsQueryHandlerTests : OrderBaseTest<GetOrderDetailsQueryHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnOrderDetails_When_OrderExists()
    {
        // 1. Arrange
        var orderId = OrderId.New();
        var query = new GetOrderDetailsQuery(orderId);
        
        var expectedDto = new OrderDetailsDto(
            Id: orderId.Value,
            Status: "Shipped",
            TotalAmount: 2500.00m,
            Currency: "JOD",
            BidderId: Guid.NewGuid(),
            WinningBidId: Guid.NewGuid(),
            HasActiveDispute: false,
            IsDisputable: true,
            CanLeaveFeedback: true
        );

        // ✅ We use the .Value to match the Guid logic in your Handler
        _orderQueries.GetOrderDetailsAsync( orderId, Arg.Any<CancellationToken>())
            .Returns(expectedDto);

        // 2. Act
        // Casting is required because Handle is explicitly implemented
        var result = await Handler.Handle(query, default);

        // 3. Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(expectedDto);
        result.Value.Id.ShouldBe(orderId.Value);
        
        await _orderQueries.Received(1).GetOrderDetailsAsync(orderId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnNotFound_When_OrderDoesNotExist()
    {
        // 1. Arrange
        var orderId = OrderId.New();
        var query = new GetOrderDetailsQuery(orderId);

        // Ensure the query service returns null to trigger the error logic
        _orderQueries.GetOrderDetailsAsync(orderId, Arg.Any<CancellationToken>())
            .Returns((OrderDetailsDto?)null);

        // 2. Act
        var result = await Handler.Handle(query, default);

        // 3. Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.NotFound);
    }
}