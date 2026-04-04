using System;
using System.Linq;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using MazadZone.Domain.Entities.Orders;
using MazadZone.Application.Orders.Queries.DTOs;
using MazadZone.Domain.Orders;

namespace MazadZone.Infrastructure.Repositories;

public class OrderRepository : IOrderRepository
{
    private readonly ApplicationDbContext _dbContext;

    public OrderRepository(ApplicationDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<Order?> GetByIdAsync(OrderId id, CancellationToken cancellationToken = default) =>
        await _dbContext.Orders.FirstOrDefaultAsync(o => o.Id == id, cancellationToken);

    public async Task AddAsync(Order order, CancellationToken cancellationToken = default) =>
        await _dbContext.Orders.AddAsync(order, cancellationToken);

    public async Task<decimal> GetTotalSalesBySellerAsync(Guid sellerId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Orders.AsNoTracking()
            .Where(o => o.SellerId.Value == sellerId && o.Status == OrderStatus.Delivered)
            .SumAsync(o => o.Amount.Value, cancellationToken);
    }

    public async Task<int> GetPendingOrdersCountAsync(CancellationToken cancellationToken = default)
    {
        return await _dbContext.Orders.AsNoTracking()
            .CountAsync(o => o.Status == OrderStatus.Pending || o.Status == OrderStatus.Confirmed, cancellationToken);
    }

    public async Task<IReadOnlyList<OrderHistoryDto>> GetOrderHistoryAsync(Guid userId, int page, int pageSize, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Orders.AsNoTracking()
            .Where(o => o.BidderId.Value == userId || o.SellerId.Value == userId)
            .OrderByDescending(o => o.CreatedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(o => new OrderHistoryDto(o.Id.Value, o.Amount.Value, o.Status.ToString(), o.CreatedAt))
            .ToListAsync(cancellationToken);
    }

    public async Task<OrderDetailsDto?> GetOrderDetailsAsync(Guid orderId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Orders.AsNoTracking()
            .Where(o => o.Id.Value == orderId)
            .Select(o => new OrderDetailsDto(
                o.Id.Value,
                o.BidderId.Value,
                o.WinningBidId.Value,
                o.Amount.Value,
                o.Status.ToString(),
                o.DepositCaptureTransactionId,
                o.CreatedAt))
            .FirstOrDefaultAsync(cancellationToken);
    }
}