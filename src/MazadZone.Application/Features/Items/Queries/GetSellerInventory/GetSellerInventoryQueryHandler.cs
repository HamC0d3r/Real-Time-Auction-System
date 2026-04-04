namespace MazadZone.Application.Features.Items.Queries.GetSellerInventory;

using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using MazadZone.Domain.Auctions; // For AuctionStatus enum
using MazadZone.Domain.Repositories;
using System.Runtime.CompilerServices;

public sealed class GetSellerInventoryQueryHandler
    : IRequestHandler<GetSellerInventoryQuery, Result<List<InventoryItemDto>>>
{
    private readonly IItemRepository _repository;

    public GetSellerInventoryQueryHandler(IItemRepository repository)
    {
        _repository = repository;
    }

    public async Task<Result<List<InventoryItemDto>>> Handle(
        GetSellerInventoryQuery request,
        CancellationToken ct)
    {
        throw new NotImplementedException("This query handler is not implemented yet. Please implement it to retrieve the seller's inventory.");
    }
}