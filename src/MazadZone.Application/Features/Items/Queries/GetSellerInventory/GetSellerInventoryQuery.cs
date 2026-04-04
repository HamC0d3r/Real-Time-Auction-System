namespace MazadZone.Application.Features.Items.Queries.GetSellerInventory;

public sealed record GetSellerInventoryQuery(Guid SellerId) : IQuery<List<InventoryItemDto>>;