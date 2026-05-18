using MazadZone.Application.Features.Orders.Commands.AddFeedback;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Commands.AddFeedback;

public class AddFeedbackValidatorTests
{
    private readonly AddFeedbackValidator _validator = new();

    [Fact]
    public void Validate_ValidCommand_PassesValidation()
    {
        // Arrange
        var command = OrderHelper.CreateAddFeedbackCommand();

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(0)]
    [InlineData(6)] 
    public void Validate_RatingIsOutOfBounds_FailsValidation(int invalidRating)
    {
        // Arrange
        var command = new AddFeedbackCommand(OrderId.New(), invalidRating, "Good");

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Rating)
              .WithErrorMessage($"Rating must be between {OrderConstants.MinRating} and {OrderConstants.MaxRating}.");
    }

    [Fact]
    public void Validate_CommentExceedsMaxLength_FailsValidation()
    {
        // Arrange
        var tooLongComment = new string('a', OrderConstants.MaxCommentLength + 1);
        var command = new AddFeedbackCommand(OrderId.New(), OrderConstants.MaxRating, tooLongComment);

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldHaveValidationErrorFor(x => x.Comment)
              .WithErrorMessage($"Comment cannot exceed {OrderConstants.MaxCommentLength} characters.");
    }
}