using Microsoft.Extensions.Logging;
using MazadZone.Application.Services;

namespace Tests.Application.Features.Bidders;

public abstract class BidderBaseTest<THandler> : GlobalTestBase
         where THandler : class
{
    protected readonly IBidderQueries _bidderQueries;

    protected readonly ILogger<THandler> Logger;
    protected readonly IPasswordService _passwordService;
    protected readonly ITokenProvider _tokenProvider;

    protected THandler Handler => AutoMocker.CreateInstance<THandler>();

    protected BidderBaseTest()
    {
        _bidderQueries = AutoMocker.GetSubstituteFor<IBidderQueries>();
        Logger = AutoMocker.GetSubstituteFor<ILogger<THandler>>();
        _passwordService = AutoMocker.GetSubstituteFor<IPasswordService>();
        _tokenProvider = AutoMocker.GetSubstituteFor<ITokenProvider>();
    }
}