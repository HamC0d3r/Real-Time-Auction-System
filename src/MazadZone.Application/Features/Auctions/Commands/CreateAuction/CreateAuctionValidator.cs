using FluentValidation;

namespace MazadZone.Application.Features.Auctions.Commands.CreateAuction;

public sealed class CreateAuctionValidator : AbstractValidator<CreateAuctionCommand>
{
    public CreateAuctionValidator()
    {
        RuleFor(x => x.ItemId)
            .NotEmpty();

        RuleFor(x => x.SellerId)
            .NotEmpty();

        RuleFor(x => x.ShippingAddress)
            .NotEmpty();

        RuleFor(x => x.StartBidAmount)    
            .GreaterThanOrEqualTo(0m)
            .WithMessage("Start bid must be zero or a positive amount.");

        RuleFor(x => x.MinBidAmount)
            .GreaterThan(0m)
            .WithMessage("Minimum bid amount must be greater than zero.");

        RuleFor(x => x.Currency)
            .IsInEnum()
            .WithMessage("Currency must be a valid value.");

        RuleFor(x => x.StartTime)
            .LessThan(x => x.EndTime)
            .WithMessage("The auction start time must be before the end time.");

        RuleFor(x => x.EndTime)
            .GreaterThan(x => x.StartTime)
            .WithMessage("The auction end time must be after the start time.");
    }
}
