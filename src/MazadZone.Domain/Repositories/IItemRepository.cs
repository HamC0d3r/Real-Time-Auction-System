using MazadZone.Domain.Auctions;
using MazadZone.Domain.Shared.Interfaces;

namespace MazadZone.Domain.Repositories;

public interface IItemRepository : IScopedService
{
    Task<Item?> GetItemByIdAsync(Guid id, CancellationToken ct);
    Task<IEnumerable<Item>> ListItemsBySellerIdAsync(Guid sellerId, CancellationToken ct);
}