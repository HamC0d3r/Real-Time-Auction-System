using MazadZone.Domain.Auctions;
using MazadZone.Domain.Bidders;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Sellers;

namespace MazadZone.Application.Features.Sellers.Commands.BecomeSeller;

internal sealed class BecomeSellerCommandHandler : ICommandHandler<BecomeSellerCommand, Unit>
{
    private readonly ISellerRepository _sellerRepository;
    private readonly IBidderRepository _bidderRepository;
    private readonly IUserRepository _userRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<BecomeSellerCommandHandler> _logger;


    public BecomeSellerCommandHandler(
        ISellerRepository sellerRepository,
        IBidderRepository bidderRepository,
        IUserRepository userRepository,
        IUnitOfWork unitOfWork,
        ILogger<BecomeSellerCommandHandler> logger
    )
    {
        _sellerRepository = sellerRepository;
        _bidderRepository = bidderRepository;
        _userRepository = userRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(BecomeSellerCommand request, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId.Value, ct);  
        if(user is null)
        {
            GlobalLogs.LogUserNotFound(_logger,request.UserId);
            return BidderErrors.NotFound; ;
        }

        var bidderId = BidderId.Load(request.UserId.Value);
        var nationalId = await _bidderRepository.GetNationalIdByBidderIdAsync(bidderId, ct);
        if(nationalId is null)
        {
            GlobalLogs.LogBidderNotFound(_logger, bidderId);
            return BidderErrors.NotFound;
        }

        var result = Seller.BecomeSeller(bidderId, nationalId, request.BankAccountNumber);

        if (result.IsFailure)
        {
            BecomeSellerLogs.LogDomainRuleViolation(_logger, request.UserId, result.TopError.Code);
            return result.TopError;
        }

        user.AddSellerRole();

        var seller = result.Value;

        _sellerRepository.Add(seller);

        await _unitOfWork.SaveChangesAsync(ct);

        BecomeSellerLogs.LogSuccess(_logger, request.UserId);

        return Unit.Value;
    }
}