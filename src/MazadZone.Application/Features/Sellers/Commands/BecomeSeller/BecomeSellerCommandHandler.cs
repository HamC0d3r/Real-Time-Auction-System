using MazadZone.Domain.Bidders;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Sellers; 

namespace MazadZone.Application.Features.Sellers.Commands.BecomeSeller;

internal sealed class BecomeSellerCommandHandler : ICommandHandler<BecomeSellerCommand, Unit>
{
    private readonly ISellerRepository _sellerRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<BecomeSellerCommandHandler> _logger;

    public BecomeSellerCommandHandler(
        ISellerRepository sellerRepository,
        IUnitOfWork unitOfWork,
        ILogger<BecomeSellerCommandHandler> logger)
    {
        _sellerRepository = sellerRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(BecomeSellerCommand request, CancellationToken cancellationToken)
    {
        var bidder = await _sellerRepository.GetByIdAsync(request.BidderId.Value);
        if(bidder is null)
        {
            GlobalLogs.LogBidderNotFound(_logger,request.BidderId);
            return BidderErrors.NotFound; ;
        }

        var result = Seller.BecomeSeller(request.BidderId, bidder.NationalId, request.BankAccountNumber);

        if (result.IsFailure)
        {
            BecomeSellerLogs.LogDomainRuleViolation(_logger, request.BidderId, result.TopError.Code);
            return result.TopError;
        }

        var seller = result.Value;

        _sellerRepository.Add(seller);
        
        _sellerRepository.Update(seller);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        BecomeSellerLogs.LogSuccess(_logger, request.BidderId);

        return Unit.Value;
    }
}