using MazadZone.Application.Features.Orders.Commands.Confirm;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Sellers;

namespace Tests.Application.Features.Orders.Events;

public class NotifySellerOnOrderConfirmedDomainEventHandlerTests
{
    // --- Dependencies ---
    private readonly ISellerRepository _sellerRepository;
    private readonly INotificationRepository _notificationService;
    private readonly NotifySellerOnOrderConfirmedDomainEventHandler _handler;

    public NotifySellerOnOrderConfirmedDomainEventHandlerTests()
    {
        _sellerRepository = Substitute.For<ISellerRepository>();
        _notificationService = Substitute.For<INotificationRepository>();
        
        _handler = new NotifySellerOnOrderConfirmedDomainEventHandler(_sellerRepository, _notificationService);
    }

    [Fact]
    public async Task Handle_Should_ReturnEarly_When_SellerIsNotFound()
    {
        // Arrange
        // Note: Assuming your OrderConfirmedDomainEvent takes OrderId and AuctionId
        var domainEvent = new OrderConfirmedDomainEvent(OrderId.New(), AuctionId.New());

        // Simulate database returning null
        _sellerRepository.GetByAuctionIdAsync(domainEvent.AuctionId, Arg.Any<CancellationToken>())
            .Returns((Seller?)null);

        // Act
        await _handler.Handle(domainEvent, default);

        // Assert
        // Verify we safely aborted without throwing an exception or sending a bad notification
        await _notificationService.DidNotReceiveWithAnyArgs()
            .NotifySellerAsync(default!, default!, default!, default);
    }

    [Fact]
    public async Task Handle_Should_SendNotification_When_SellerIsFound()
    {
        // Arrange
        var domainEvent = new OrderConfirmedDomainEvent(OrderId.New(), AuctionId.New());
        var expectedSeller = CreateValidSeller();

        _sellerRepository.GetByAuctionIdAsync(domainEvent.AuctionId, Arg.Any<CancellationToken>())
            .Returns(expectedSeller);

        // Act
        await _handler.Handle(domainEvent, default);

        // Assert
        var expectedTitle = "Payment Confirmed - Action Required!";

        // Verify the notification was sent to the right seller, with the right title, 
        // and that the message body successfully included the dynamic Order ID.
        await _notificationService.Received(1).NotifySellerAsync(
            expectedSeller.Id.Value,
            expectedTitle,
            Arg.Is<string>(msg => msg.Contains(domainEvent.OrderId.Value.ToString()) && msg.Contains("Payment has been secured")),
            Arg.Any<CancellationToken>()
        );
    }

    // --- Helper Methods ---

    /// <summary>
    /// Centralizes the creation of a valid dummy Seller for testing purposes.
    /// </summary>
    private static Seller CreateValidSeller()
    {
        return Seller.BecomeSeller(BidderId.New(), "Tests Bank Acoount", "Test National Id").Value; 
    }
}