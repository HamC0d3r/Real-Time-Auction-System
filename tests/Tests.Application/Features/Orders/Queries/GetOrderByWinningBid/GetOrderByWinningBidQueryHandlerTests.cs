using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Features.Orders.Queries.GetOrderByWinningBid;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Queries.GetOrderByWinningBid;

public class GetOrderByWinningBidQueryHandlerTests : OrderBaseTest<GetOrderByWinningBidQueryHandler>
{
    [Fact]
    public async Task Handle_OrderExists_ReturnsOrderDetails()
    {
        // 1. Arrange
        var query = OrderHelper.CreateGetOrderByWinningBidQuery();

        // Use 'with' to easily link the IDs together without changing the helper
        var expectedDto = OrderHelper.CreateOrderDetailsDto() with { WinningBidId = query.WinningBidId.Value };


        // ✅ Use Arg.Is with the Value to avoid Vogen's default constructor check
        _orderQueries.GetOrderByWinningBidAsync(query.WinningBidId, Arg.Any<CancellationToken>())
            .Returns(expectedDto);

        // 2. Act
        // Cast to IRequestHandler because of the explicit interface implementation in the handler
        var result = await Handler.Handle(query, default);

        // 3. Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(expectedDto); // Value equality works automatically for records
        
        await _orderQueries.Received(1).GetOrderByWinningBidAsync(query.WinningBidId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_OrderDoesNotExist_ReturnsNotFoundError()
    {
        // 1. Arrange
        var query = OrderHelper.CreateGetOrderByWinningBidQuery();

        _orderQueries.GetOrderByWinningBidAsync(query.WinningBidId, Arg.Any<CancellationToken>())
            .Returns((OrderDetailsDto?)null);

        // 2. Act
        var result = await Handler.Handle(query, default);

        // 3. Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.NotFound);
    }
}