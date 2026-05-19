using MazadZone.Domain.Repositories;
using MazadZone.Domain.Sellers;

namespace MazadZone.Application.Features.Sellers.Commands.Verify;

public sealed class VerifyCommandHandler : ICommandHandler<VerifyCommand, Unit>
{
    private readonly ISellerRepository _sellerRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<VerifyCommandHandler> _logger;

    public VerifyCommandHandler(
        ISellerRepository sellerRepository,
        IUnitOfWork unitOfWork,
        ILogger<VerifyCommandHandler> logger)
    {
        _sellerRepository = sellerRepository;
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(VerifyCommand request, CancellationToken cancellationToken)
    {
        // 1. Retrieve the aggregate via strong type ID
        var seller = await _sellerRepository.GetByIdAsync(request.SellerId.Value, cancellationToken);

        if (seller is null)
        {
            GlobalLogs.LogSellerNotFound(_logger, request.SellerId);
            return SellerErrors.NotFound;
        }

        // 2. Execute domain method
        seller.Verify();

        // 3. Explicitly call Update to mark as modified
        _sellerRepository.Update(seller);

        // 4. Commit transaction
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        // 5. Log Success
        VerifyLogs.LogSuccess(_logger, request.SellerId);

        return Unit.Value;
    }
}