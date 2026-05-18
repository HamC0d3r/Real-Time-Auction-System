using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Features.Orders.Queries.GetGlobalStats;

namespace Tests.Application.Features.Orders.Queries.GetGlobalStats;

public class GetGlobalStatsQueryHandlerTests : OrderBaseTest<GetGlobalStatsQueryHandler>
{
    [Fact]
    public async Task Handle_QueriesAreSuccessful_ReturnsGlobalStats()
    {
        // 1. Arrange - Using the positional record constructor
        var expectedStats = OrderHelper.CreateAdminGlobalStatsDto();

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
    public async Task Handle_NoDataExists_ReturnsEmptyStats()
    {
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