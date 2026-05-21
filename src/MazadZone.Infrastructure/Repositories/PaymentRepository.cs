using MazadZone.Domain.Payments.ValueObjects;
using MazadZone.Domain.Repositories;
using MazadZone.Infrastructure.Persistence;
using MzadZone.Domain.Payments;

namespace MazadZone.Infrastructure.Repositories;

public class PaymentRepository : GenericRepository<Payment>, IPaymentRepository
{
    private readonly AppDbContext _context;

    public PaymentRepository(AppDbContext context) : base(context)
    {
        _context = context;
    }
    
    public Task<Payment?> GetByIdAsync(PaymentId paymentId, CancellationToken cancellationToken)
    {
        throw new NotImplementedException();
    }
}