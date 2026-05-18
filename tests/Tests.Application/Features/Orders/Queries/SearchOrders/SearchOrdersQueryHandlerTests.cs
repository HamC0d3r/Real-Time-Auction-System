using MazadZone.Application.Common.Paging;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Features.Orders.Queries.SearchOrders;

namespace Tests.Application.Features.Orders.Queries.SearchOrders;

public class SearchOrdersQueryHandlerTests : OrderBaseTest<SearchOrdersQueryHandler>
{
    [Fact]
    public async Task Handle_OrdersMatchFilter_ReturnsPagedList()
    {
        // 1. Arrange
        // Using the new positional record constructor with named arguments for clarity
        var filter = OrderHelper.CreateOrderSearchFilter();

        var query = new SearchOrdersQuery(filter);

        var summaries = OrderHelper.CreateOrderSummaries();

        // Create the paged result expected from the query service
        var pagedList = new PagedList<OrderSummaryDto>(summaries, filter.PageNumber, filter.PageSize, summaries.Count);

        _orderQueries.SearchOrdersAsync(filter, Arg.Any<CancellationToken>())
            .Returns(pagedList);

        // 2. Act
        // Explicit interface cast is required to access the 'Handle' method
        var result = await Handler.Handle(query, default);

        // 3. Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.TotalCount.ShouldBe(summaries.Count);
        
        // Verify the query service received the exact record values
        await _orderQueries.Received(1).SearchOrdersAsync(filter, Arg.Any<CancellationToken>());
    }

    [Fact]
    public async Task Handle_DefaultFilterValues_ReturnsEmptyPagedList()
    {
        // 1. Arrange
        // Testing the record's default PageSize (10) and PageNumber (1)
        var filter = new OrderSearchFilter(null, null);
        var query = new SearchOrdersQuery(filter);

        var emptyPagedList = new PagedList<OrderSummaryDto>(new List<OrderSummaryDto>(), filter.PageNumber, filter.PageSize, 0);

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