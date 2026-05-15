using System;
using MazadZone.Domain.Payments.ValueObjects;
using MzadZone.Domain.Payments;

namespace MazadZone.Domain.Repositories;

public interface IPaymentRepository
{
    Task AddAsync(Payment payment, CancellationToken cancellationToken);
    Task<Payment?> GetByIdAsync(PaymentId paymentId, CancellationToken cancellationToken);
    void Update(Payment payment);
    void Delete(Payment payment);
}