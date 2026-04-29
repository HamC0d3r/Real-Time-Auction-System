using MazadZone.Domain.Auctions;
using MazadZone.Domain.Users;

namespace MazadZone.Domain.Repositories;

public interface ISellerRepository
{
    Task<Seller?> GetByIdAsync(SellerId id, CancellationToken cancellationToken = default);
    //Task AddAsync(DomainEventNotification notification, CancellationToken cancellationToken = default);
}