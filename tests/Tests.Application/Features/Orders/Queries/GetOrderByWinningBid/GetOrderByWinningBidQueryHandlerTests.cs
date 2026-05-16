using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Features.Orders.Queries.GetOrderByWinningBid;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Queries.GetOrderByWinningBid;

public class GetOrderByWinningBidQueryHandlerTests : OrderBaseTest<GetOrderByWinningBidQueryHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnOrderDetails_When_OrderExists()
    {
        // 1. Arrange
        var winningBidId = BidId.New();
        var query = new GetOrderByWinningBidQuery(winningBidId);
        
        // Using the new positional record constructor
        var expectedDto = new OrderDetailsDto(
            Id: Guid.NewGuid(),
            Status: "Confirmed",
            TotalAmount: 1500.00m,
            Currency: "JOD",
            BidderId: Guid.NewGuid(),
            WinningBidId: winningBidId.Value,
            HasActiveDispute: false,
            IsDisputable: true,
            CanLeaveFeedback: false
        );

        // ✅ Use Arg.Is with the Value to avoid Vogen's default constructor check
        _orderQueries.GetOrderByWinningBidAsync(winningBidId, Arg.Any<CancellationToken>())
            .Returns(expectedDto);

        // 2. Act
        // Cast to IRequestHandler because of the explicit interface implementation in the handler
        var result = await Handler.Handle(query, default);

        // 3. Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(expectedDto); // Value equality works automatically for records
        
        await _orderQueries.Received(1).GetOrderByWinningBidAsync(winningBidId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnNotFound_When_OrderDoesNotExist()
    {
        // 1. Arrange
        var winningBidId = BidId.New();
        var query = new GetOrderByWinningBidQuery(winningBidId);

        _orderQueries.GetOrderByWinningBidAsync(winningBidId, Arg.Any<CancellationToken>())
            .Returns((OrderDetailsDto?)null);

        // 2. Act
        var result = await Handler.Handle(query, default);

        // 3. Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.NotFound);
    }
}