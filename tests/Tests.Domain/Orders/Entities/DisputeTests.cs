using MazadZone.Domain.Orders;
using Shouldly;
using Xunit;

namespace Tests.Domain.Orders.Entities;

public class DisputeTests
{
    // --- Helper Methods ---
    private static OrderId GenerateOrderId() => OrderId.New(); // Adjust if your OrderId generation differs
    
    private static Dispute CreateValidOpenDispute()
    {
        return Dispute.Create(GenerateOrderId(), "Item arrived damaged").Value;
    }

    // --- 1. Creation Tests ---

    [Fact]
    public void Create_Should_ReturnFailure_When_ReasonIsInvalid()
    {
        // Arrange
        var invalidReason = ""; // Assuming empty strings fail Reason.Create()

        // Act
        var result = Dispute.Create(GenerateOrderId(), invalidReason);

        // Assert
        result.IsFailure.ShouldBeTrue();
        // The error should bubble up from the Reason Value Object
        result.TopError.ShouldNotBeNull(); 
    }

    [Fact]
    public void Create_Should_InitializeDispute_When_ReasonIsValid()
    {
        // Arrange
        var orderId = GenerateOrderId();
        var reasonText = "Item does not match description";

        // Act
        var result = Dispute.Create(orderId, reasonText);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        var dispute = result.Value;

        dispute.OrderId.ShouldBe(orderId);
        dispute.Reason.Text.ShouldBe(reasonText); // Assuming Reason has a Value property
        dispute.Status.ShouldBe(DisputeStatus.Open);
        dispute.IsResolved.ShouldBeFalse();
        dispute.Resolution.ShouldBeNull();
        dispute.ResolvedAtUtc.ShouldBeNull();
        
        // Ensure CreatedAtUtc was set recently
        dispute.CreatedAtUtc.ShouldNotBe(default);
        dispute.CreatedAtUtc.ShouldBeInRange(DateTime.UtcNow.AddSeconds(-2), DateTime.UtcNow.AddSeconds(2));
    }

    // --- 2. Change Reason Tests ---

    [Fact]
    public void ChangeReason_Should_Fail_When_DisputeIsAlreadyResolved()
    {
        // Arrange
        var dispute = CreateValidOpenDispute();
        dispute.Resolve("Refund processed."); // Resolve it

        var newReason = Reason.Create("Actually, I just don't want it anymore").Value;

        // Act
        var result = dispute.ChangeReason(newReason);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.DisputeCannotChangeReason);
    }

    [Fact]
    public void ChangeReason_Should_Succeed_When_DisputeIsOpen()
    {
        // Arrange
        var dispute = CreateValidOpenDispute();
        var newReasonText = "Wait, I found the missing part but it is broken";
        var newReason = Reason.Create(newReasonText).Value;

        // Act
        var result = dispute.ChangeReason(newReason);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        dispute.Reason.Text.ShouldBe(newReasonText);
    }

    // --- 3. Resolve Tests ---

    [Fact]
    public void Resolve_Should_Fail_When_DisputeIsAlreadyResolved()
    {
        // Arrange
        var dispute = CreateValidOpenDispute();
        dispute.Resolve("First resolution."); // Resolve it once

        // Act: Try to resolve again
        var result = dispute.Resolve("Second resolution attempt.");

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.DisputeAlreadyResolved);
    }

    [Fact]
    public void Resolve_Should_Fail_When_ResolutionTextIsInvalid()
    {
        // Arrange
        var dispute = CreateValidOpenDispute();
        var invalidResolution = ""; // Assuming Resolution.Create rejects empty strings

        // Act
        var result = dispute.Resolve(invalidResolution);

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldNotBeNull(); // Bubbles up from Resolution.Create
        
        // Ensure state wasn't accidentally mutated
        dispute.Status.ShouldBe(DisputeStatus.Open);
        dispute.IsResolved.ShouldBeFalse();
    }

    [Fact]
    public void Resolve_Should_Succeed_And_UpdateState_When_Valid()
    {
        // Arrange
        var dispute = CreateValidOpenDispute();
        var resolutionText = "Agreed to return item for full refund.";

        // Act
        var result = dispute.Resolve(resolutionText);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        dispute.Status.ShouldBe(DisputeStatus.Resolved);
        dispute.IsResolved.ShouldBeTrue();
        dispute.Resolution.ShouldNotBeNull();
        dispute.Resolution!.Value.ShouldBe(resolutionText);
        
        // Ensure ResolvedAtUtc was set
        dispute.ResolvedAtUtc.ShouldNotBeNull();
        dispute.ResolvedAtUtc.Value.ShouldBeInRange(DateTime.UtcNow.AddSeconds(-2), DateTime.UtcNow.AddSeconds(2));
    }
}