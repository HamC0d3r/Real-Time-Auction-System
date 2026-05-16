using Microsoft.Extensions.Logging;
using MazadZone.Application.Services;
using MazadZone.Domain.Repositories;

namespace Tests.Application.Features.Orders;

public abstract class OrderBaseTest<THandler> : GlobalTestBase
         where THandler : class
{
    protected readonly IOrderRepository _orderRepository;
    protected readonly IOrderQueries _orderQueries; 

    protected readonly ILogger<THandler> Logger;

    protected THandler Handler => AutoMocker.CreateInstance<THandler>();

    protected OrderBaseTest()
    {
        _orderRepository = AutoMocker.GetSubstituteFor<IOrderRepository>();
        _orderQueries = AutoMocker.GetSubstituteFor<IOrderQueries>();
        Logger = AutoMocker.GetSubstituteFor<ILogger<THandler>>();
    }
}