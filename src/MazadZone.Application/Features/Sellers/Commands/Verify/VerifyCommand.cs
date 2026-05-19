using MazadZone.Domain.Auctions;

namespace MazadZone.Application.Features.Sellers.Commands.Verify;

public sealed record VerifyCommand(SellerId SellerId) : ICommand<Unit>;