using FluentValidation.TestHelper;
using MazadZone.Application.Features.Orders.Commands.AddFeedback;
using MazadZone.Domain.Orders;

namespace Tests.Application.Features.Orders.Commands.AddFeedback;

public class AddFeedbackValidatorTests
{
    private readonly AddFeedbackValidator _validator = new();

    [Fact]
    public void Should_Not_Have_Error_When_Command_Is_Valid()
    {
        // Arrange
        var command = new AddFeedbackCommand(
            OrderId: OrderId.New(), // Assuming your command has an OrderId
            Rating: OrderConstants.MaxRating, 
            Comment: "Great transaction, highly recommended!"
        );

        // Act
        var result = _validator.TestValidate(command);

        // Assert
        result.ShouldNotHaveAnyValidationErrors();
    }

    [Theory]
    [InlineData(0)] // Assuming MinRating is 1
    [InlineData(6)] // Assuming MaxRating is 5
    public void Should_Have_Error_When_Rating_Is_Out_Of_Bounds(int invalidRating)
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
    public void Should_Have_Error_When_Comment_Exceeds_MaxLength()
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