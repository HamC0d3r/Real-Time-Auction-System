using MazadZone.Domain.Orders;
using Shouldly;

namespace Tests.Domain.Orders.ValueObjects;

public class RatingTests
{
    // --- 1. Validation Failures (Out of Bounds) ---

    [Fact]
    public void Create_ValueIsBelowMinimum_ReturnsInvalidRatingError()
    {
        // Arrange: Dynamically calculate a value 1 step below the allowed minimum
        var tooLowRating = OrderConstants.MinRating - 1;

        // Act
        var result = Rating.Create(tooLowRating);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.FeedbackInvalidRating);
    }

    [Fact]
    public void Create_ValueIsAboveMaximum_ReturnsInvalidRatingError()
    {
        // Arrange: Dynamically calculate a value 1 step above the allowed maximum
        var tooHighRating = OrderConstants.MaxRating + 1;

        // Act
        var result = Rating.Create(tooHighRating);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.FeedbackInvalidRating);
    }

    // --- 2. Success Paths (Valid Bounds) ---

    [Fact]
    public void Create_ValueIsExactlyMinimum_InitializesRating()
    {
        // Act
        var result = Rating.Create(OrderConstants.MinRating);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.Value.ShouldBe(OrderConstants.MinRating);
    }

    [Fact]
    public void Create_ValueIsExactlyMaximum_InitializesRating()
    {
        // Act
        var result = Rating.Create(OrderConstants.MaxRating);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.Value.ShouldBe(OrderConstants.MaxRating);
    }

    // --- 3. Value Object Behaviors (Equality) ---

    [Fact]
    public void Equality_SameValues_EvaluatesToTrue()
    {
        // Arrange
        var validValue = OrderConstants.MaxRating;
        var rating1 = Rating.Create(validValue).Value;
        var rating2 = Rating.Create(validValue).Value;

        // Act & Assert
        // Because 'Rating' is a record, this proves it compares by 'Value' and not by memory reference.
        rating1.ShouldBe(rating2);
        (rating1 == rating2).ShouldBeTrue();
    }
}