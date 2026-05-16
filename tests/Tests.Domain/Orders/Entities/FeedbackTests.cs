using MazadZone.Domain.Orders;
using Shouldly;

namespace Tests.Domain.Orders.Entities;

public class FeedbackTests
{
    // --- Helper Methods ---
    private static OrderId GenerateOrderId() => OrderId.New();
    
    private static Feedback CreateValidFeedback()
    {
        return Feedback.Create(GenerateOrderId(), OrderConstants.MaxRating, "Excellent transaction!").Value;
    }

    // --- 1. Creation Tests ---

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void Create_Should_ReturnFailure_When_CommentIsEmptyOrWhitespace(string invalidComment)
    {
        // Act
        var result = Feedback.Create(GenerateOrderId(), 5, invalidComment);

        // Assert
        result.IsFailure.ShouldBeTrue();
        // Checks your explicit Entity-level validation
        result.TopError.ShouldBe(OrderErrors.FeedbackCommentEmpty); 
    }

    [Fact]
    public void Create_Should_ReturnFailure_When_RatingIsInvalid()
    {
        // Arrange
        var invalidRating = OrderConstants.MaxRating + 1;

        // Act
        var result = Feedback.Create(GenerateOrderId(), invalidRating, "Good item.");

        // Assert
        result.IsFailure.ShouldBeTrue();
        // Error bubbles up from the Rating Value Object
        result.TopError.ShouldNotBeNull(); 
    }

    [Fact]
    public void Create_Should_ReturnFailure_When_CommentIsTooLong()
    {
        // Arrange
        var tooLongComment = new string('A', OrderConstants.MaxCommentLength + 1);

        // Act
        var result = Feedback.Create(GenerateOrderId(), 5, tooLongComment);

        // Assert
        result.IsFailure.ShouldBeTrue();
        // Error bubbles up from the Comment Value Object
        result.TopError.ShouldNotBeNull(); 
    }

    [Fact]
    public void Create_Should_InitializeFeedback_When_Valid()
    {
        // Arrange
        var orderId = GenerateOrderId();
        var ratingValue = 5;
        var commentText = "Arrived on time and exactly as described.";

        // Act
        var result = Feedback.Create(orderId, ratingValue, commentText);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        var feedback = result.Value;

        feedback.OrderId.ShouldBe(orderId);
        feedback.Rating.Value.ShouldBe(ratingValue);
        feedback.Comment.Value.ShouldBe(commentText);
        feedback.Reply.ShouldBeNull();
        feedback.RepliedAtUtc.ShouldBeNull();
        
        // Ensure CreatedAtUtc was set properly
        feedback.CreatedAtUtc.ShouldNotBe(default);
        feedback.CreatedAtUtc.ShouldBeInRange(DateTime.UtcNow.AddSeconds(-2), DateTime.UtcNow.AddSeconds(2));
    }

    // --- 2. Add Reply Tests ---

    [Theory]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData(null)]
    public void AddReply_Should_ReturnFailure_When_ReplyIsEmptyOrWhitespace(string invalidReply)
    {
        // Arrange
        var feedback = CreateValidFeedback();

        // Act
        var result = feedback.AddReply(invalidReply);

        // Assert
        result.IsFailure.ShouldBeTrue();
        // Checks your explicit Entity-level validation
        result.TopError.ShouldBe(FeedbackErrors.EmptyReply);
    }

    [Fact]
    public void AddReply_Should_ReturnFailure_When_ReplyIsTooLong()
    {
        // Arrange
        var feedback = CreateValidFeedback();
        var tooLongReply = new string('A', OrderConstants.MaxCommentLength + 1);

        // Act
        var result = feedback.AddReply(tooLongReply);

        // Assert
        result.IsFailure.ShouldBeTrue();
        // Error bubbles up from the Comment Value Object
        result.TopError.ShouldNotBeNull();
    }

    [Fact]
    public void AddReply_Should_ReturnFailure_When_ReplyAlreadyExists()
    {
        // Arrange
        var feedback = CreateValidFeedback();
        feedback.AddReply("Thank you for your business."); // First reply succeeds

        // Act: Try to reply again
        var result = feedback.AddReply("Actually, I wanted to add something else.");

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(FeedbackErrors.AlreadyReplied);
    }

    [Fact]
    public void AddReply_Should_Succeed_And_UpdateState_When_Valid()
    {
        // Arrange
        var feedback = CreateValidFeedback();
        var replyText = "You are a great buyer, enjoy the item!";

        // Act
        var result = feedback.AddReply(replyText);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        
        feedback.Reply.ShouldNotBeNull();
        feedback.Reply!.Value.ShouldBe(replyText);
        
        // Ensure RepliedAtUtc was set properly
        feedback.RepliedAtUtc.ShouldNotBeNull();
        feedback.RepliedAtUtc.Value.ShouldBeInRange(DateTime.UtcNow.AddSeconds(-2), DateTime.UtcNow.AddSeconds(2));
    }
}