// namespace MazadZone.Application.Features.Listings.CreateListing;

// using FluentValidation;

// public sealed class CreateListingValidator : AbstractValidator<CreateListingCommand>
// {
//     public CreateListingValidator()
//     {
//         RuleFor(x => x.Title).NotEmpty().MaximumLength(100);
//         RuleFor(x => x.Description).NotEmpty().MaximumLength(2000);
//         RuleFor(x => x.StartBidAmount).GreaterThanOrEqualTo(0);
//         RuleFor(x => x.MinBidAmount).GreaterThan(0);
//         RuleFor(x => x.StartTime).LessThan(x => x.EndTime)
//             .WithMessage("Start time must be before end time.");
//         RuleFor(x => x.ImagePaths).NotEmpty().WithMessage("At least one image is required.");
//     }
// }