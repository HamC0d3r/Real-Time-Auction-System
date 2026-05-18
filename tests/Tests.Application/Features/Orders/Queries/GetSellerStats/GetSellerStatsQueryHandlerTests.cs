using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Features.Orders.Queries.GetSellerStats;
using MazadZone.Domain.Auctions;

namespace Tests.Application.Features.Orders.Queries.GetSellerStats;

public class GetSellerStatsQueryHandlerTests : OrderBaseTest<GetSellerStatsQueryHandler>
{
    [Fact]
    public async Task Handle_SellerExists_ReturnsSellerStats()
    {
        // 1. Arrange
        var query = new GetSellerStatsQuery(SellerId.New());

        var expectedDto = OrderHelper.CreateSellerOrderStatsDto();

        _orderQueries.GetSellerStatsAsync(query.SellerId, Arg.Any<CancellationToken>())
            .Returns(expectedDto);

        // 2. Act
        var result = await Handler.Handle(query, default);

        // 3. Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(expectedDto); // Record value equality
        result.Value.TotalSales.ShouldBe(expectedDto.TotalSales);
        
        await _orderQueries.Received(1).GetSellerStatsAsync(query.SellerId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_QueryServiceReturnsNull_ReturnsEmptyStats()
    {
        // 1. Arrange
        var query = new GetSellerStatsQuery(SellerId.New());

        _orderQueries.GetSellerStatsAsync(query.SellerId, Arg.Any<CancellationToken>())
            .Returns((SellerOrderStatsDto?)null!);

        // 2. Act
        var result = await Handler.Handle(query, default);

        // 3. Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(SellerOrderStatsDto.Empty);
        result.Value.TotalSales.ShouldBe(0m);
        result.Value.AverageRating.ShouldBe(0);
    }
}