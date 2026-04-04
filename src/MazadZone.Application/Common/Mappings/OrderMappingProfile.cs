using AutoMapper;
using MazadZone.Application.Features.Orders.Commands.CreateOrder;
using MazadZone.Domain.Orders;

namespace MazadZone.Application.Orders.CreateOrder;

public class OrderMappingProfile : Profile
{
    public OrderMappingProfile()
    {
        // CreateMap<CreateOrderCommand, Order>()
        // .ConstructUsing(command => Order.Create(
        //     command.BidderId,
        //     command.WinningBidId,
        //     command.ReceiptAddressId,
        //     command.Amount,
        //     command.DepositCaptureTransactionId
        // ).Value);
    }
}