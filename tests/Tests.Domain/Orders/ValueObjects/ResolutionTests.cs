using MazadZone.Domain.Orders;
using Shouldly;

namespace Tests.Domain.Orders.ValueObjects;

public class ResolutionTests
{
    // --- 1. Validation Failures ---

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData(" ")]
    [InlineData("   ")]
    public void Create_Should_ReturnFailure_When_TextIsNullOrWhitespace(string invalidText)
    {
        // Act
        var result = Resolution.Create(invalidText);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(ResolutionErrors.Empty);
    }

    [Fact]
    public void Create_Should_ReturnFailure_When_TextIsTooShort()
    {
        // Arrange: Create a string exactly 1 character shorter than the minimum
        var tooShortText = new string('A', OrderConstants.MinResolutionLength - 1);

        // Act
        var result = Resolution.Create(tooShortText);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(ResolutionErrors.TooShort);
    }

    [Fact]
    public void Create_Should_ReturnFailure_When_TextIsTooLong()
    {
        // Arrange: Create a string exactly 1 character longer than the maximum
        var tooLongText = new string('A', OrderConstants.MaxResolutionLength + 1);

        // Act
        var result = Resolution.Create(tooLongText);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(ResolutionErrors.TooLong);
    }

    // --- 2. Success Paths & Data Sanitization ---

    [Fact]
    public void Create_Should_ReturnSuccess_And_TrimWhitespace_When_Valid()
    {
        // Arrange
        var validCoreText = "Refund issued to buyer.";
        var untrimmedText = $"   {validCoreText}   ";

        // Act
        var result = Resolution.Create(untrimmedText);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        
        // This explicitly proves the sanitization works
        result.Value.Value.ShouldBe(validCoreText); 
    }

    [Fact]
    public void Create_Should_ReturnSuccess_When_LengthIsExactlyMinimum()
    {
        // Arrange
        var exactMinText = new string('A', OrderConstants.MinResolutionLength);

        // Act
        var result = Resolution.Create(exactMinText);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.Value.ShouldBe(exactMinText);
    }

    [Fact]
    public void Create_Should_ReturnSuccess_When_LengthIsExactlyMaximum()
    {
        // Arrange
        var exactMaxText = new string('A', OrderConstants.MaxResolutionLength);

        // Act
        var result = Resolution.Create(exactMaxText);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.Value.ShouldBe(exactMaxText);
    }

    // --- 3. Value Object Behaviors (Equality & Conversions) ---

    [Fact]
    public void ImplicitOperator_Should_ConvertTo_String()
    {
        // Arrange
        var text = "Agreed to split shipping costs.";
        var resolution = Resolution.Create(text).Value;

        // Act
        string stringValue = resolution; // Testing the implicit conversion

        // Assert
        stringValue.ShouldBe(text);
    }

    [Fact]
    public void Records_Should_Support_ValueEquality()
    {
        // Arrange
        var text = "Full refund provided.";
        var res1 = Resolution.Create(text).Value;
        var res2 = Resolution.Create(text).Value;

        // Act & Assert
        // Proves that records compare the internal 'Value' and not the memory reference
        res1.ShouldBe(res2);
        (res1 == res2).ShouldBeTrue();
    }
}