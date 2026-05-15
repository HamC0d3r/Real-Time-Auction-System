using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;

namespace MazadZone.Application.Features.Orders.Commands.AddFeedback;

public sealed class UpdateSellerRatingOnFeedbackLeftDomainEventHandler : INotificationHandler<FeedbackLeftDomainEvent>
{
    private readonly ISellerRepository _sellerRepository;
    private readonly IUnitOfWork _unitOfWork;

    public UpdateSellerRatingOnFeedbackLeftDomainEventHandler(ISellerRepository sellerRepository, IUnitOfWork unitOfWork)
    {
        _sellerRepository = sellerRepository;
        _unitOfWork = unitOfWork;
    }

    public async Task Handle(FeedbackLeftDomainEvent notification, CancellationToken ct)
    {
        var seller = await _sellerRepository.GetByAuctionIdAsync(notification.AuctionId, ct);
        if (seller is null) return;

        seller.UpdateRating(notification.Rating);
        await _unitOfWork.SaveChangesAsync(ct);
    }
}