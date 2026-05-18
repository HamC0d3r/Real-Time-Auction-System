using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Features.Orders.Queries.GetOrderDetails;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Queries.GetOrderDetails;

public class GetOrderDetailsQueryHandlerTests : OrderBaseTest<GetOrderDetailsQueryHandler>
{
    [Fact]
    public async Task Handle_OrderExists_ReturnsOrderDetails()
    {
        // 1. Arrange
        var query = new GetOrderDetailsQuery(OrderId.New());

        var expectedDto = OrderHelper.CreateOrderDetailsDto() with {Id = query.OrderId.Value};

        _orderQueries.GetOrderDetailsAsync( query.OrderId, Arg.Any<CancellationToken>())
            .Returns(expectedDto);

        // 2. Act
        // Casting is required because Handle is explicitly implemented
        var result = await Handler.Handle(query, default);

        // 3. Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(expectedDto);
        result.Value.Id.ShouldBe(query.OrderId.Value);
        
        await _orderQueries.Received(1).GetOrderDetailsAsync(query.OrderId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_OrderDoesNotExist_ReturnsNotFoundError()
    {
        // 1. Arrange
        var query = new GetOrderDetailsQuery(OrderId.New());

        // Ensure the query service returns null to trigger the error logic
        _orderQueries.GetOrderDetailsAsync(query.OrderId, Arg.Any<CancellationToken>())
            .Returns((OrderDetailsDto?)null);

        // 2. Act
        var result = await Handler.Handle(query, default);

        // 3. Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.NotFound);
    }
}