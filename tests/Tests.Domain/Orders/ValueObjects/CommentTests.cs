using MazadZone.Domain.Orders;
using Shouldly;

namespace Tests.Domain.Orders.ValueObjects;

public class CommentTests
{
    // --- 1. Validation Failures ---

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("   ")]
    [InlineData(null)]
    public void Create_ValueIsEmptyOrWhitespace_ReturnsEmptyError(string invalidValue)
    {
        // Act
        var result = Comment.Create(invalidValue);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(FeedbackErrors.Comment.Empty);
    }

    [Fact]
    public void Create_ValueIsTooLong_ReturnsTooLongError()
    {
        // Arrange
        // Generate a string that is exactly 1 character over the limit
        var tooLongValue = new string('A', OrderConstants.MaxCommentLength + 1);

        // Act
        var result = Comment.Create(tooLongValue);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(FeedbackErrors.Comment.TooLong);
    }

    // --- 2. Success Paths ---

    [Fact]
    public void Create_ValidValue_InitializesComment()
    {
        // Arrange
        var validValue = "This was a fantastic transaction!";

        // Act
        var result = Comment.Create(validValue);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.Value.ShouldBe(validValue);
    }

    [Fact]
    public void Create_ValueIsExactlyMaxLength_InitializesComment()
    {
        // Arrange
        var exactLengthValue = new string('A', OrderConstants.MaxCommentLength);

        // Act
        var result = Comment.Create(exactLengthValue);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.Value.ShouldBe(exactLengthValue);
    }

    // --- 3. Value Object Behaviors (Conversions & Equality) ---

    [Fact]
    public void ImplicitConversion_ToString_ReturnsUnderlyingValue()
    {
        // Arrange
        var originalText = "Great item.";
        var comment = Comment.Create(originalText).Value;

        // Act
        string stringValue = comment; // Testing the implicit conversion

        // Assert
        stringValue.ShouldBe(originalText);
    }

    [Fact]
    public void ToString_ReturnsUnderlyingValue()
    {
        // Arrange
        var originalText = "Fast shipping.";
        var comment = Comment.Create(originalText).Value;

        // Act
        var toStringResult = comment.ToString();

        // Assert
        toStringResult.ShouldBe(originalText);
    }

    [Fact]
    public void Equality_SameValues_EvaluatesToTrue()
    {
        // Arrange
        var text = "Same comment";
        var comment1 = Comment.Create(text).Value;
        var comment2 = Comment.Create(text).Value;

        // Act & Assert
        // Because Comment is a 'record', this checks the values, not the memory addresses
        comment1.ShouldBe(comment2);
        (comment1 == comment2).ShouldBeTrue();
    }
}