using MazadZone.Application.Features.Bidders.DTOs;
using MazadZone.Application.Features.Orders.Commands.AddFeedback;
using MazadZone.Application.Features.Orders.Commands.Confirm;
using MazadZone.Application.Features.Orders.Commands.Create;
using MazadZone.Application.Features.Orders.Commands.DeliverOrder;
using MazadZone.Application.Features.Orders.Commands.OpenDispute;
using MazadZone.Application.Features.Orders.Commands.ResolveDispute;
using MazadZone.Application.Features.Orders.Commands.ShipOrder;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Application.Features.Orders.Queries.GetOrderByWinningBid;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Orders.Events;
using MazadZone.Domain.Shared.ValueObjects;

namespace Tests.Application.Features.Orders;

public static class OrderHelper
{
    /// <summary>
    /// Centralizes the creation of a pending order for testing purposes, 
    /// fulfilling all required Domain constraints.
    /// </summary>
    public static Order CreatePendingOrder(decimal? amount = null)
    {
        var address = new Address("123 Test St", "Amman", "11118", "Jordan");

        return Order.Create(
            AuctionId.New(),
            BidderId.New(),
            BidId.New(),
            address,
            amount ?? 150.00m,
            "txn_deposit_123"
        ).Value;
    }

    /// <summary>
    /// Creates an order and advances its state to Confirmed.
    /// </summary>
    public static Order CreateConfirmedOrder()
    {
        var order = CreatePendingOrder();
        order.Confirm();
        return order;
    }

    /// <summary>
    /// Creates an order and advances its state through Confirmed to Shipped.
    /// </summary>
    public static Order CreateShippedOrder()
    {
        var order = CreateConfirmedOrder();
        order.Ship();
        return order;
    }

    /// <summary>
    /// Creates an order and advances its state through Confirmed and Shipped to Delivered.
    /// </summary>
    public static Order CreateDeliveredOrder()
    {
        var order = CreateShippedOrder();
        order.Deliver();
        return order;
    }

    /// <summary>
    /// Creates an order and transitions its state from Pending to Cancelled.
    /// </summary>
    public static Order CreateCancelledOrder()
    {
        var order = CreatePendingOrder();
        order.Cancel(); // Allowed because the initial state is Pending
        return order;
    }

    /// <summary>
    /// Centralizes the creation of a dummy FeedbackLeftDomainEvent for testing purposes.
    /// </summary>
    public static FeedbackLeftDomainEvent CreateFeedbackLeftEvent()
    {
        return new FeedbackLeftDomainEvent(
            OrderId.New(),
            AuctionId.New(),
            5,
            "Great seller!"
        );
    }

    /// <summary>
    /// Centralizes the creation of a valid AddFeedbackCommand for testing purposes.
    /// </summary>
    public static AddFeedbackCommand CreateAddFeedbackCommand()
    {
        return new AddFeedbackCommand(
            OrderId.New(),
            5,
            "Excellent transaction."
        );
    }

    public static ConfirmOrderCommand CreateConfirmOrderCommand(OrderId? orderId = null)
    {
        return new ConfirmOrderCommand(orderId ?? OrderId.New());
    }

    /// <summary>
    /// Centralizes the creation of a dummy OrderConfirmedDomainEvent for testing purposes.
    /// </summary>
    public static OrderConfirmedDomainEvent CreateOrderConfirmedEvent()
    {
        return new OrderConfirmedDomainEvent(
            OrderId.New(),
            AuctionId.New()
        );
    }

    public static CreateOrderCommand CreateOrderCommand()
    {
        var address = new AddressDto("123 Test St", "Amman", "11118", "Jordan");

        return new CreateOrderCommand(
            AuctionId.New(),
            BidderId.New(),
            BidId.New(),
            address, // Assuming your command accepts the Address Value Object here
            150.00m,
            "txn_deposit_123"
        );
    }

    public static DeliverOrderCommand CreateDeliverOrderCommand()
                => new DeliverOrderCommand(OrderId.New());

    public static OrderDeliveredDomainEvent CreateOrderDeliveredEvent()
    {
        return new OrderDeliveredDomainEvent(
            OrderId.New(),
            AuctionId.New(),
            BidderId.New()
        );
    }

    public static DisputeOpenedDomainEvent CreateDisputeOpenedEvent()
    {
        return new DisputeOpenedDomainEvent(OrderId.New(), DisputeId.New());
    }

    public static OpenDisputeCommand CreateOpenDisputeCommand()
        => new OpenDisputeCommand(OrderId.New(), "Testing Reason");


    public static DisputeResolvedDomainEvent CreateDisputeResolvedEvent()
    {
        return new DisputeResolvedDomainEvent(
                    OrderId.New(),
                    AuctionId.New(),
                    DisputeId.New(),
                    "Resolution Testing.");
    }

    public static ResolveDisputeCommand CreateResolveDisputeCommand()
        => new ResolveDisputeCommand(OrderId.New(), "Resolve Reason Testing.");


    public static ShipOrderCommand CreateShipOrderCommand()
        => new ShipOrderCommand(OrderId.New());

    /// <summary>
    /// Centralizes the creation of a fixed AdminGlobalStatsDto for testing purposes.
    /// </summary>
    public static AdminGlobalStatsDto CreateAdminGlobalStatsDto()
    {
        return new AdminGlobalStatsDto(
            TotalSalesVolume: 25000.75m,
            TotalOrders: 50,
            TotalRealizedRevenue: 18000.00m,
            AverageOrderValue: 360.00m,
            TotalPendingAmount: 5000.25m,
            TotalPendingOrders: 10,
            TotalCanceledAmount: 2000.50m,
            TotalCanceledOrders: 5,
            TotalActiveDisputes: 3
        );
    }

    /// <summary>
    /// Centralizes the creation of a baseline GetOrderByWinningBidQuery.
    /// </summary>
    public static GetOrderByWinningBidQuery CreateGetOrderByWinningBidQuery() =>
        new(BidId.New());

    /// <summary>
    /// Centralizes the creation of a fixed OrderDetailsDto for testing purposes.
    /// </summary>
    public static OrderDetailsDto CreateOrderDetailsDto()
    {
        return new OrderDetailsDto(
            Id: Guid.NewGuid(),
            Status: "Confirmed",
            TotalAmount: 1500.00m,
            Currency: "JOD",
            BidderId: Guid.NewGuid(),
            WinningBidId: Guid.NewGuid(), // Generates a random baseline Guid
            HasActiveDispute: false,
            IsDisputable: true,
            CanLeaveFeedback: false
        );
    }

    /// <summary>
    /// Centralizes the creation of a fixed SellerOrderStatsDto for testing purposes.
    /// </summary>
    public static SellerOrderStatsDto CreateSellerOrderStatsDto()
    {
        return new SellerOrderStatsDto(
            TotalSales: 5000.00m,
            TotalRevenue: 4500.00m,
            PendingOrders: 5,
            ActiveDisputes: 1,
            AverageRating: 4.8
        );
    }

/// <summary>
    /// Centralizes the creation of a baseline OrderSearchFilter for testing pagination and filtering.
    /// </summary>
    public static OrderSearchFilter CreateOrderSearchFilter() =>
        new(
            UserId: Guid.NewGuid(), 
            Status: "Shipped", 
            PageSize: 5, 
            PageNumber: 1
        );

    /// <summary>
    /// Centralizes the creation of a mock list containing a single baseline OrderSummaryDto.
    /// </summary>
    public static List<OrderSummaryDto> CreateOrderSummaries() =>
    [
        new(
            Id: Guid.NewGuid(), 
            Status: "Shipped", 
            TotalAmount: 450.00m, 
            Currency: "JOD", 
            CreatedAt: DateTime.UtcNow, 
            HasActiveDispute: true, 
            IsDisputable: false, 
            CanLeaveFeedback: false
        )
    ];

}