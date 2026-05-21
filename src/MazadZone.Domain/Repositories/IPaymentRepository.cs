using System;
using MazadZone.Domain.Payments.ValueObjects;
using MazadZone.Domain.Shared.Interfaces;
using MzadZone.Domain.Payments;

namespace MazadZone.Domain.Repositories;

public interface IPaymentRepository : IGenericRepository<Payment>, IScopedService
{
    Task<Payment?> GetByIdAsync(PaymentId paymentId, CancellationToken cancellationToken);
}