using MazadZone.Application.Features.Orders.Commands.Deliver;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Sellers;

namespace Tests.Application.Features.Orders.Commands.Deliver;

public class NotifySellerOnOrderDeliveredDomainEventHandlerTests
{
    private readonly ISellerRepository _sellerRepository;
    private readonly INotificationRepository _notificationService;
    private readonly NotifySellerOnOrderDeliveredDomainEventHandler _handler;

    public NotifySellerOnOrderDeliveredDomainEventHandlerTests()
    {
        // Arrange
        _sellerRepository = Substitute.For<ISellerRepository>();
        _notificationService = Substitute.For<INotificationRepository>();
        
        _handler = new NotifySellerOnOrderDeliveredDomainEventHandler(
            _notificationService, 
            _sellerRepository);
    }

    [Fact]
    public async Task Handle_Should_ReturnEarly_When_SellerIsNotFound()
    {
        // Arrange
        var domainEvent = new OrderDeliveredDomainEvent(
            OrderId.New(),
            AuctionId.New(),
            BidderId.New());

        _sellerRepository.GetByAuctionIdAsync(domainEvent.AuctionId, Arg.Any<CancellationToken>())
            .Returns((Seller?)null);

        // Act
        await _handler.Handle(domainEvent, default);

        // Assert
        // Ensure no notification is attempted if we can't find the seller
        await _notificationService.DidNotReceiveWithAnyArgs()
            .NotifySellerAsync(default!, default!, default!, default);
    }

    [Fact]
    public async Task Handle_Should_NotifySeller_With_CorrectDetails_When_SellerExists()
    {
        // Arrange
        var domainEvent = new OrderDeliveredDomainEvent(
            OrderId.New(),
            AuctionId.New(),
            BidderId.New());

        var seller = CreateValidSeller();
        _sellerRepository.GetByAuctionIdAsync(domainEvent.AuctionId, Arg.Any<CancellationToken>())
            .Returns(seller);

        const string expectedTitle = "Product Received! Delivery Successful 📦";

        // Act
        await _handler.Handle(domainEvent, default);

        // Assert
        // We verify the notification is sent to the correct SellerId
        await _notificationService.Received(1).NotifySellerAsync(
            seller.Id.Value,
            expectedTitle,
            Arg.Is<string>(msg => msg.Contains(domainEvent.OrderId.Value.ToString()) && 
                                  msg.Contains("funds will be released")),
            Arg.Any<CancellationToken>());
    }

    // --- Helper Methods ---
    private static Seller CreateValidSeller()
    {
        return Seller.BecomeSeller(BidderId.New(), "Tests Bank Acoount", "Test National Id").Value;
    }
}