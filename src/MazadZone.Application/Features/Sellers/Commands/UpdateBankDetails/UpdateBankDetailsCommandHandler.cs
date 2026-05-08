using MazadZone.Domain.Repositories;
using MazadZone.Domain.Sellers;

namespace MazadZone.Application.Features.Sellers.Commands.UpdateBankDetails;

internal sealed class UpdateBankDetailsCommandHandler : ICommandHandler<UpdateBankDetailsCommand, Unit>
{
    private readonly ISellerRepository _sellerRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateBankDetailsCommandHandler> _logger;

    public UpdateBankDetailsCommandHandler(
        ISellerRepository sellerRepository,
        IUnitOfWork unitOfWork,
        ILogger<UpdateBankDetailsCommandHandler> logger)
    {
        _sellerRepository = sellerRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(UpdateBankDetailsCommand request, CancellationToken cancellationToken)
    {
        var seller = await _sellerRepository.GetByIdAsync(request.SellerId.Value, cancellationToken);

        if (seller is null)
        {
            GlobalLogs.LogSellerNotFound(_logger, request.SellerId);
            return SellerErrors.NotFound;
        }

        var updateResult = seller.UpdateBankDetails(request.NewAccountNumber);
        if(updateResult.IsFailure)
        {
            UpdateBankDetailsLogs.LogDomainRuleViolation(_logger, request.SellerId, updateResult.TopError.Code);
            return updateResult.TopError;
        }

        _sellerRepository.Update(seller);

        await _unitOfWork.SaveChangesAsync(cancellationToken);

        UpdateBankDetailsLogs.LogSuccess(_logger, request.SellerId);

        return Unit.Value;
    }
}