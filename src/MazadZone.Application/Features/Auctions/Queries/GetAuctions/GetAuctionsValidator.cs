using FluentValidation;

namespace MazadZone.Application.Features.Auctions.Queries.GetAuctions;

public sealed class GetAuctionsValidator : AbstractValidator<GetAuctionsQuery>
{
    public GetAuctionsValidator()
    {
        RuleFor(x => x.Page)
            .GreaterThan(0)
            .WithMessage("Page must be greater than 0.");

        RuleFor(x => x.PageSize)
            .GreaterThan(0)
            .LessThanOrEqualTo(100)
            .WithMessage("Page size must be between 1 and 100.");

        RuleFor(x => x.SearchTerm)
            .MaximumLength(200)
            .When(x => !string.IsNullOrEmpty(x.SearchTerm))
            .WithMessage("Search term must not exceed 200 characters.");

        RuleFor(x => x.CurrentBidAmount.Max)
            .GreaterThanOrEqualTo(0)
            .When(x => x.CurrentBidAmount.Max.HasValue)
            .WithMessage("Current bid amount must be zero or positive.");
        
        RuleFor(x => x.CurrentBidAmount.Min)
            .GreaterThanOrEqualTo(0)
            .When(x => x.CurrentBidAmount.Min.HasValue);


        RuleFor(x => x.SortBy)
            .Must(x => new[] { "CreationDate", "StartTime", "EndTime", "CurrentBidAmount" }.Contains(x))
            .WithMessage("Sort by must be one of: CreationDate, StartTime, EndTime, CurrentBidAmount.");

        RuleFor(x => x.SortDirection)
            .Must(x => x == "asc" || x == "desc")
            .WithMessage("Sort direction must be 'asc' or 'desc'.");
    }
}
