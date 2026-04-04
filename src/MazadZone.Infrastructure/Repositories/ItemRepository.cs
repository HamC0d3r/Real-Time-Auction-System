using MazadZone.Domain.Auctions;
using MazadZone.Domain.Repositories;

namespace MazadZone.Infrastructure.Repositories;

public class ItemRepository : IItemRepository
{
    public Task<Item?> GetItemByIdAsync(Guid id, CancellationToken ct)
    {
        throw new NotImplementedException();
    }

    public async  Task<IEnumerable<Item>> ListItemsBySellerIdAsync(Guid sellerId, CancellationToken ct)
    {
        // var inventory = await _dbcontext.items
        //     .asnotracking() // critical for reads: tells ef core not to track changes, boosting performance
        //     .where(item => item.sellerid == sellerid)
        //     .select(item => new inventoryitemdto(
        //         item.id.value,
        //         item.title,
        //         // safely grab the first image path, or empty string if no images exist
        //         item.images.firstordefault() != null ? item.images.firstordefault()!.path : string.empty,
                
        //         // the dynamic status calculation
        //         _dbcontext.auctions.any(a => a.itemid == item.id && (a.status == auctionstatus.active || a.status == auctionstatus.pending))
        //             ? inventoryitemstatus.inauction
        //             : _dbcontext.auctions.any(a => a.itemid == item.id && a.status == auctionstatus.ended && a.currentleadingbid != null)
        //                 ? inventoryitemstatus.sold
        //                 : inventoryitemstatus.available
        //     ))
        //     .tolistasync(ct);

        // return result.success(inventory);

        throw new NotImplementedException();
    }
}