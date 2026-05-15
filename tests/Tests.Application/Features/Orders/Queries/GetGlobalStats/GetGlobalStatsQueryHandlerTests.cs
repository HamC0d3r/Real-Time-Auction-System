using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Features.Orders.Queries.GetGlobalStats;

namespace Tests.Application.Features.Orders.Queries.GetGlobalStats;

public class GetGlobalStatsQueryHandlerTests : OrderBaseTest<GetGlobalStatsQueryHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnGlobalStats_When_QueriesAreSuccessful()
    {
        // 1. Arrange - Using the positional record constructor
        var expectedStats = new AdminGlobalStatsDto(
            TotalSalesVolume: 25000.75m,
            TotalOrders: 50,
            TotalRealizedRevenue: 18000.00m,
            AverageOrderValue: 360.00m,
            TotalPendingAmount: 5000.25m,
            TotalPendingOrders: 10,
            TotalCanceledAmount: 2000.50m,
            TotalCanceledOrders: 5,
            TotalActiveDisputes: 3
        );

        var query = new GetGlobalStatsQuery();

        _orderQueries.GetGlobalStatsAsync(Arg.Any<CancellationToken>())
            .Returns(expectedStats);

        // 2. Act
        var result = await Handler.Handle(query, default);

        // 3. Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldBe(expectedStats); // Records have built-in value equality
        
        await _orderQueries.Received(1).GetGlobalStatsAsync(Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_ReturnEmptyStats_When_NoDataExists()
    {
        // Arrange - Testing your static 'Empty' property logic
        var query = new GetGlobalStatsQuery();
        
        _orderQueries.GetGlobalStatsAsync(Arg.Any<CancellationToken>())
            .Returns(AdminGlobalStatsDto.Empty);

        // Act
        var result = await Handler.Handle(query, default);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.TotalSalesVolume.ShouldBe(0);
        result.Value.TotalOrders.ShouldBe(0);
    }
}