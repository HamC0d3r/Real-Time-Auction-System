using MazadZone.Domain.Auctions;

namespace MazadZone.Domain.Repositories;

public interface IItemRepository
{
    Task<Item?> GetItemByIdAsync(Guid id, CancellationToken ct);
    Task<IEnumerable<Item>> ListItemsBySellerIdAsync(Guid sellerId, CancellationToken ct);
}