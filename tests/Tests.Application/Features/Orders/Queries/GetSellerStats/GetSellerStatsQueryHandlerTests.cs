using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Features.Orders.Queries.GetSellerStats;
using MazadZone.Domain.Auctions;

namespace Tests.Application.Features.Orders.Queries.GetSellerStats;

public class GetSellerStatsQueryHandlerTests : OrderBaseTest<GetSellerStatsQueryHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnSellerStats_When_SellerExists()
    {
        // 1. Arrange
        var sellerId = SellerId.New();
        var query = new GetSellerStatsQuery(sellerId);
        
        var expectedDto = new SellerOrderStatsDto(
            TotalSales: 5000.00m,
            TotalRevenue: 4500.00m,
            PendingOrders: 5,
            ActiveDisputes: 1,
            AverageRating: 4.8
        );

        // ✅ Use Arg.Is to match the SellerId by value, avoiding Vogen default crashes
        _orderQueries.GetSellerStatsAsync(sellerId, Arg.Any<CancellationToken>())
            .Returns(expectedDto);

        // 2. Act
        var result = await Handler.Handle(query, default);

        // 3. Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(expectedDto); // Record value equality
        result.Value.TotalSales.ShouldBe(5000.00m);
        
        await _orderQueries.Received(1).GetSellerStatsAsync(sellerId, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnEmptyStats_When_QueryServiceReturnsNull()
    {
        // 1. Arrange
        var sellerId = SellerId.New();
        var query = new GetSellerStatsQuery(sellerId);

        _orderQueries.GetSellerStatsAsync(sellerId, Arg.Any<CancellationToken>())
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