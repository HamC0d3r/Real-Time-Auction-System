using System;
using System.Collections.Generic;
using System.Linq;
using MazadZone.Domain.Payments.Enums;
using MazadZone.Domain.Payments.Errors;
using MazadZone.Domain.Payments.Events;
using MazadZone.Domain.Payments.ValueObjects;
using MazadZone.Domain.Users.ValueObjects;
using MzadZone.Domain.Payments.Entities;

namespace MzadZone.Domain.Payments;

public sealed class Payment : AggregateRoot<PaymentId>
{
    private readonly List<Transaction> _transactions = new();

#pragma warning disable CS8618 
    private Payment() { }
#pragma warning restore CS8618

    private Payment(
        PaymentId id, OrderId orderId, UserId userId, Money amount) 
        : base(id)
    {
        OrderId = orderId;
        UserId = userId;
        Amount = amount;
        Status = PaymentStatus.Pending;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public OrderId OrderId { get; private init; }
    public UserId UserId { get; private init; }
    public Money Amount { get; private init; }
    public PaymentStatus Status { get; private set; }
    
    public DateTime CreatedAtUtc { get; private init; }
    public DateTime? CompletedAtUtc { get; private set; }
    
    // Encapsulate the collection
    public IReadOnlyCollection<Transaction> Transactions => _transactions.AsReadOnly();

    public static Result<Payment> Create(OrderId orderId, UserId userId, Money amount)
    {
        if (amount <= Money.Zero())
            return Result.Failure<Payment>(PaymentErrors.AmountMustBeGreaterThanZero);

        var paymentId = PaymentId.From(Guid.NewGuid());       
        
        var payment = new Payment(paymentId, orderId, userId, amount);
        
        payment.RaiseDomainEvent(new PaymentCreatedDomainEvent(paymentId, orderId));
        return Result.Success(payment);
    }

    // Records the intent to execute a transaction
    public Result RecordTransactionAttempt(string gatewayIntentId, TransactionType transactionType)
    {
        if (Status == PaymentStatus.Completed || Status == PaymentStatus.Refunded)
            return Result.Failure(PaymentErrors.AlreadyProcessed(Status));

        if (_transactions.Any(t => t.GatewayIntentId == gatewayIntentId))
            return Result.Failure(PaymentErrors.DuplicateTransaction);

        var transaction = new Transaction(new TransactionId(Guid.NewGuid()), this.Id, gatewayIntentId, transactionType);
        _transactions.Add(transaction);

        return Result.Success();
    }

    // Resolves a specific transaction and recalculates the overall payment status
    public Result ResolveTransactionSuccess(string gatewayIntentId)
    {
        var transaction = _transactions.SingleOrDefault(t => t.GatewayIntentId == gatewayIntentId);
        
        if (transaction == null)
            return Result.Failure(PaymentErrors.TransactionNotFound);

        transaction.MarkAsSuccess();
        EvaluatePaymentStatus();

        return Result.Success();
    }

    public Result ResolveTransactionFailure(string gatewayIntentId, string reason)
    {
        var transaction = _transactions.SingleOrDefault(t => t.GatewayIntentId == gatewayIntentId);
        
        if (transaction == null)
            return Result.Failure(PaymentErrors.TransactionNotFound);

        transaction.MarkAsFailed(reason);
        EvaluatePaymentStatus();

        return Result.Success();
    }

    // The business rules for financial state transitions
    // This method evaluates the overall payment status based on the current transactions.
    // For example: - If there's a successful capture, the payment is completed.
    //              - If there's a successful authorization but no capture, the payment is authorized. 
    private void EvaluatePaymentStatus()
    {
        bool hasSuccessfulCapture = _transactions.Any(t => t.Type == TransactionType.Capture && t.Status == TransactionStatus.Success);
        bool hasSuccessfulAuth = _transactions.Any(t => t.Type == TransactionType.AuthorizationHold && t.Status == TransactionStatus.Success);
        
        if (hasSuccessfulCapture && Status != PaymentStatus.Completed)
        {
            Status = PaymentStatus.Completed;
            CompletedAtUtc = DateTime.UtcNow;
            RaiseDomainEvent(new PaymentCompletedDomainEvent(this.Id, this.OrderId));
        }
        else if (hasSuccessfulAuth && Status == PaymentStatus.Pending)
        {
            Status = PaymentStatus.Authorized;
            RaiseDomainEvent(new PaymentAuthorizedDomainEvent(this.Id, this.OrderId));
        }
        else if (_transactions.All(t => t.Status == TransactionStatus.Failed))
        {
             Status = PaymentStatus.Failed;
             RaiseDomainEvent(new PaymentFailedDomainEvent(this.Id, this.OrderId));
        }
    }
}