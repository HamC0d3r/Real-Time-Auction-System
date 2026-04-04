namespace MazadZone.Application.Features.Auctions.RelistItem;

// Relisting usually happens when an old auction ID is known
public sealed record RelistItemCommand(
    Guid OldAuctionId,
    Guid SellerId,
    decimal NewStartBid,
    DateTime NewStart,
    DateTime NewEnd) : ICommand<Guid>;