using MazadZone.Domain.Auctions;

namespace MazadZone.Application.Features.Auctions.Commands.CancelAuction;

public sealed record CancelAuctionCommand(AuctionId AuctionId, string Reason) : ICommand<Unit>;