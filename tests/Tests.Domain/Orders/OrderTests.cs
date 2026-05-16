using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Shared.ValueObjects;
using Shouldly;

namespace Tests.Domain.Orders;

public class OrderTests
{
    private static Order CreateValidPendingOrder()
    {
        var address = new Address("123 Test St", "Amman", "11118", "Jordan");
        return Order.Create(
            AuctionId.New(),
            BidderId.New(),
            BidId.New(),
            address,
            150.00m, 
            "txn_123").Value;
    }


    [Fact]
    public void Create_Should_ReturnFailure_When_TotalAmountIsInvalid()
    {
        // Arrange
        var address = new Address("123 Test St", "Amman", "11118", "Jordan");

        // Act
        var result = Order.Create(AuctionId.New(), BidderId.New(), BidId.New(), address, -10m, "txn");

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.TotalAmountTooLow); // Or whatever error Money.Create returns
    }

    [Fact]
    public void Create_Should_InitializeOrder_And_RaiseEvent_When_Valid()
    {
        // Act
        var order = CreateValidPendingOrder();

        // Assert
        order.Status.ShouldBe(OrderStatus.Pending);
        order.TotalAmount.Amount.ShouldBe(150.00m);
        
        // Verify Domain Event was raised (Assuming your AggregateRoot exposes DomainEvents)
        var domainEvent = order.DomainEvents.OfType<OrderCreatedDomainEvent>().SingleOrDefault();
        domainEvent.ShouldNotBeNull();
        domainEvent.OrderId.ShouldBe(order.Id);
    }

    // --- 2. STATE MACHINE (Confirm, Ship, Deliver, Cancel) ---

    [Fact]
    public void Cancel_Should_Fail_When_OrderIsNotPending()
    {
        // Arrange
        var order = CreateValidPendingOrder();
        order.Confirm(); // Move to Confirmed

        // Act
        var result = order.Cancel();

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.CannotCancel);
    }

    [Fact]
    public void Cancel_Should_Succeed_When_OrderIsPending()
    {
        var order = CreateValidPendingOrder();
        var result = order.Cancel();

        result.IsSuccess.ShouldBeTrue();
        order.Status.ShouldBe(OrderStatus.Canceled);
        order.DomainEvents.OfType<OrderCancelledDomainEvent>().ShouldHaveSingleItem();
    }

    [Fact]
    public void Confirm_Should_Fail_When_OrderIsNotPending()
    {
        var order = CreateValidPendingOrder();
        order.Cancel(); // Move out of Pending

        var result = order.Confirm();

        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.CannotConfirm);
    }

[Fact]
    public void Confirm_Should_Succeed_And_RaiseEvent_When_OrderIsPending()
    {
        // Arrange
        var order = CreateValidPendingOrder(); // Status is Pending

        // Act
        var result = order.Confirm();

        // Assert
        result.IsSuccess.ShouldBeTrue();
        order.Status.ShouldBe(OrderStatus.Confirmed);
        order.DomainEvents.OfType<OrderConfirmedDomainEvent>().ShouldHaveSingleItem();
    }

    [Fact]
    public void Ship_Should_Fail_When_OrderIsNotConfirmed()
    {
        var order = CreateValidPendingOrder(); // Status is Pending

        var result = order.Ship();

        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.CannotShipped);
    }

[Fact]
    public void Ship_Should_Succeed_And_RaiseEvent_When_OrderIsConfirmed()
    {
        // Arrange
        var order = CreateValidPendingOrder();
        order.Confirm(); // Move to Confirmed

        // Act
        var result = order.Ship();

        // Assert
        result.IsSuccess.ShouldBeTrue();
        order.Status.ShouldBe(OrderStatus.Shipped);
        order.DomainEvents.OfType<OrderShippedDomainEvent>().ShouldHaveSingleItem();
    }

    [Fact]
    public void Deliver_Should_Succeed_And_RaiseEvent_When_OrderIsShipped()
    {
        // Arrange: Walk the state machine forward
        var order = CreateValidPendingOrder();
        order.Confirm();
        order.Ship();

        // Act
        var result = order.Deliver();

        // Assert
        result.IsSuccess.ShouldBeTrue();
        order.Status.ShouldBe(OrderStatus.Delivered);
        order.DomainEvents.OfType<OrderDeliveredDomainEvent>().ShouldHaveSingleItem();
    }

    [Fact]
    public void Deliver_Should_Fail_When_OrderIsNotShipped()
    {
        // Arrange
        var order = CreateValidPendingOrder();
        order.Confirm(); // Status is Confirmed, skipping the 'Shipped' state

        // Act
        var result = order.Deliver();

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.CannotDeliver);
    }

    // --- 3. FEEDBACK ---

    [Fact]
    public void AddFeedback_Should_Fail_When_OrderIsNotDelivered()
    {
        var order = CreateValidPendingOrder(); // Pending state

        var result = order.AddFeedback(5, "Great");

        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.FeedbackRequiresDelivered);
    }

    [Fact]
    public void AddFeedback_Should_Fail_When_FeedbackAlreadyExists()
    {
        var order = CreateValidPendingOrder();
        order.Confirm(); order.Ship(); order.Deliver(); // Move to valid state
        
        order.AddFeedback(5, "First"); // Add initial feedback

        // Act: Try again
        var result = order.AddFeedback(1, "Second");

        // Assert
        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.FeedbackAlreadyExists);
    }

    [Fact]
    public void AddFeedback_Should_Succeed_And_RaiseEvent_When_Valid()
    {
        var order = CreateValidPendingOrder();
        order.Confirm(); order.Ship(); order.Deliver();

        var result = order.AddFeedback(5, "Perfect");

        result.IsSuccess.ShouldBeTrue();
        order.FeedbackId.ShouldNotBeNull();
        order.DomainEvents.OfType<FeedbackLeftDomainEvent>().ShouldHaveSingleItem();
    }

    [Fact]
    public void ReplyToFeedback_Should_Fail_When_NoFeedbackExists()
    {
        var order = CreateValidPendingOrder();

        var result = order.ReplyToFeedback("Thanks!");

        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.NoFeedback);
    }

[Fact]
    public void ReplyToFeedback_Should_Succeed_And_RaiseEvent_When_FeedbackExists()
    {
        // Arrange: Build the entire state chain required to leave a reply
        var order = CreateValidPendingOrder();
        order.Confirm(); 
        order.Ship(); 
        order.Deliver();
        order.AddFeedback(5, "Fast shipping, great item!"); // Buyer leaves feedback

        // Act: Seller replies
        var result = order.ReplyToFeedback("Thank you for your purchase!");

        // Assert
        result.IsSuccess.ShouldBeTrue();
        
        // Verify the event was raised to notify the buyer
        order.DomainEvents.OfType<FeedbackRepliedDomainEvent>().ShouldHaveSingleItem();
    }

    // --- 4. DISPUTES ---

    [Fact]
    public void OpenDispute_Should_Fail_When_OrderIsPendingOrConfirmed()
    {
        var order = CreateValidPendingOrder(); // Pending

        var result = order.OpenDispute("Item damaged");

        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.CannotDispute);
    }

    [Fact]
    public void OpenDispute_Should_Fail_When_DisputeAlreadyExists()
    {
        var order = CreateValidPendingOrder();
        order.Confirm(); order.Ship(); // Valid state for dispute
        
        order.OpenDispute("First dispute");

        var result = order.OpenDispute("Second dispute");

        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.DisputeAlreadyExists);
    }

    [Fact]
    public void OpenDispute_Should_Succeed_And_RaiseEvent_When_Valid()
    {
        var order = CreateValidPendingOrder();
        order.Confirm(); order.Ship(); // Shipped status allows disputes

        var result = order.OpenDispute("Never arrived");

        result.IsSuccess.ShouldBeTrue();
        order.DisputeId.ShouldNotBeNull();
        order.DomainEvents.OfType<DisputeOpenedDomainEvent>().ShouldHaveSingleItem();
    }

    [Fact]
    public void ResolveDispute_Should_Fail_When_NoDisputeExists()
    {
        var order = CreateValidPendingOrder();

        var result = order.ResolveDispute("Refund issued");

        result.IsFailure.ShouldBeTrue();
        result.TopError.ShouldBe(OrderErrors.NoDispute);
    }

    [Fact]
    public void ResolveDispute_Should_Succeed_When_Valid()
    {
        // Arrange
        var order = CreateValidPendingOrder();
        order.Confirm();
        order.Ship();
        order.OpenDispute("Item broken Tests"); // Open it first

        // Act
        var result = order.ResolveDispute("Refunded");

        // Assert
        result.IsSuccess.ShouldBeTrue();
        order.DomainEvents.OfType<DisputeResolvedDomainEvent>().ShouldHaveSingleItem();
        // Assuming Dispute entity exposes an IsResolved property
        // order.Dispute.IsResolved.ShouldBeTrue(); 
    }

[Fact]
    public void ResolveDispute_Should_Fail_When_DisputeResolutionFails()
    {
        // Arrange
        var order = CreateValidPendingOrder();
        order.Confirm(); 
        order.Ship();
        order.OpenDispute("Item was damaged in transit");
        
        // Resolve it the first time (Success)
        order.ResolveDispute("Refund issued to buyer");

        // Act: Attempt to resolve an already-resolved dispute
        var result = order.ResolveDispute("Trying to resolve again");

        // Assert
        result.IsFailure.ShouldBeTrue();
        
        // Note: The specific error will come from your Dispute entity.
        // It might be DisputeErrors.AlreadyResolved, but we assert it is not null to prove the failure bubbled up.
        result.TopError.ShouldNotBeNull(); 
        
        // Prove we didn't raise a duplicate resolution event
        order.DomainEvents.OfType<DisputeResolvedDomainEvent>().Count().ShouldBe(1);
    }
}