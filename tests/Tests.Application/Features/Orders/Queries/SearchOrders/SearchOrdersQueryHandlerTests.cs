using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Features.Orders.Queries.SearchOrders;

namespace Tests.Application.Features.Orders.Queries.SearchOrders;

public class SearchOrdersQueryHandlerTests : OrderBaseTest<SearchOrdersQueryHandler>
{
    [Fact]
    public async Task Handle_Should_ReturnPagedList_When_OrdersMatchFilter()
    {
        // 1. Arrange
        // Using the new positional record constructor with named arguments for clarity
        var filter = new OrderSearchFilter(
            UserId: Guid.NewGuid(), 
            Status: "Shipped", 
            PageSize: 5, 
            PageNumber: 1);

        var query = new SearchOrdersQuery(filter);

        var summaries = new List<OrderSummaryDto>
        {
            new(Guid.NewGuid(), "Shipped", 450.00m, "JOD", DateTime.UtcNow, true, false, false)
        };

        // Create the paged result expected from the query service
        var pagedList = new PagedList<OrderSummaryDto>(summaries, 1, 5, 1);

        _orderQueries.SearchOrdersAsync(filter, Arg.Any<CancellationToken>())
            .Returns(pagedList);

        // 2. Act
        // Explicit interface cast is required to access the 'Handle' method
        var result = await Handler.Handle(query, default);

        // 3. Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.Items.Count.ShouldBe(1);
        result.Value.TotalCount.ShouldBe(1);
        
        // Verify the query service received the exact record values
        await _orderQueries.Received(1).SearchOrdersAsync(filter, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_Should_WorkWithDefaultFilterValues()
    {
        // 1. Arrange
        // Testing the record's default PageSize (10) and PageNumber (1)
        var filter = new OrderSearchFilter(null, null);
        var query = new SearchOrdersQuery(filter);

        var emptyPagedList = new PagedList<OrderSummaryDto>(new List<OrderSummaryDto>(), 1, 10, 0);

        _orderQueries.SearchOrdersAsync(filter, Arg.Any<CancellationToken>())
            .Returns(emptyPagedList);

        // 2. Act
        var result = await Handler.Handle(query, default);

        // 3. Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.TotalCount.ShouldBe(0);
        
        // Verify defaults were preserved
        filter.PageSize.ShouldBe(10);
        filter.PageNumber.ShouldBe(1);
    }
}