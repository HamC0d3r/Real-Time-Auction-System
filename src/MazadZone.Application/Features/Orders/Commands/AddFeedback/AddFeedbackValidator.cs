using MazadZone.Domain.Orders;

namespace MazadZone.Application.Features.Orders.Commands.AddFeedback;

public class AddFeedbackValidator : AbstractValidator<AddFeedbackCommand>
{
    public AddFeedbackValidator()
    {
        RuleFor(x => x.Rating)
            .InclusiveBetween(OrderConstants.MinRating, OrderConstants.MaxRating)
            .WithMessage($"Rating must be between {OrderConstants.MinRating} and {OrderConstants.MaxRating}.");
        RuleFor(x => x.Comment)
            .MaximumLength(OrderConstants.MaxCommentLength)
            .WithMessage($"Comment cannot exceed {OrderConstants.MaxCommentLength} characters.");
    }
}