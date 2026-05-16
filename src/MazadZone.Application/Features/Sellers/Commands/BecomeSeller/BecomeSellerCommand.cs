using MazadZone.Domain.Auctions;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Features.Sellers.Commands.BecomeSeller;

public sealed record BecomeSellerCommand(UserId UserId, string BankAccountNumber) : ICommand<Unit>;