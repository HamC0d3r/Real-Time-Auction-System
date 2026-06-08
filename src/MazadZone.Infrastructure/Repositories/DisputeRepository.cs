using MazadZone.Domain.Disputes;
using MazadZone.Domain.Orders;
using MazadZone.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace MazadZone.Infrastructure.Repositories;

public class DisputeRepository :GenericRepository<Dispute, DisputeId>, IDisputeRepository
{
    private readonly AppDbContext _context;

    public DisputeRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }

    public async Task<Dispute?> GetByOrderIdAsync(OrderId orderId, CancellationToken ct)
    {
        return await _context.Disputes.FirstOrDefaultAsync(d => d.OrderId == orderId, ct);
    }

    public Task<bool> OrderHasOpenDisputeAsync(OrderId orderId, CancellationToken ct)
    {
        return _context.Disputes.AnyAsync(d => d.OrderId == orderId && d.Status == DisputeStatus.Open, ct);
    }
}