namespace MazadZone.Application.Features.Items.Queries.GetSellerInventory;

public enum InventoryItemStatus
{
    Available, // Draft or Relistable
    InAuction, // Currently active or pending start
    Sold       // Auction ended with a winner
}

public sealed record InventoryItemDto
{
    public Guid ItemId { get; init; }
    public string Title { get; init; }
    public string PrimaryImagePath { get; init; }
    public InventoryItemStatus Status { get; init; }
}
