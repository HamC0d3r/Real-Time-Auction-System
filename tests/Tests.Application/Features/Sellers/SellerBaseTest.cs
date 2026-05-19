using Microsoft.Extensions.Logging;
using MazadZone.Application.Features.Sellers.Queries;

namespace Tests.Application.Features.Sellers;

public abstract class SellerBaseTest<THandler> : GlobalTestBase
         where THandler : class
{
    protected readonly ISellerQueries _sellerQueries; 

    protected readonly ILogger<THandler> Logger;
    
    protected THandler Handler => AutoMocker.CreateInstance<THandler>();

    protected SellerBaseTest()
    {
        Logger = AutoMocker.GetSubstituteFor<ILogger<THandler>>();
        _sellerQueries = AutoMocker.GetSubstituteFor<ISellerQueries>();
    }
}