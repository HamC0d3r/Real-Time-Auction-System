using System.Text.RegularExpressions;
using MazadZone.Domain.Payments.Enums;
using MazadZone.Domain.Payments.Errors;
using MazadZone.Domain.Payments.Events;
using MazadZone.Domain.Payments.ValueObjects;
using MazadZone.Domain.Shared.Errors;
using MazadZone.Domain.Users.ValueObjects;
using MzadZone.Domain.Payments.Entities;

namespace MzadZone.Domain.Payments;

public sealed class Payment : AggregateRoot<PaymentId>
{
    private readonly List<Transaction> _transactions = new();

    private Payment() { }

    private Payment(
        PaymentId id, OrderId orderId, UserId userId, Money? capturedHoldedAmount, Money? capturedRemainingAmount = null) 
        : base(id)
    {
        OrderId = orderId;
        UserId = userId;
        CapturedHoldedAmount = capturedHoldedAmount;
        CapturedRemainingAmount = capturedRemainingAmount;
        Status = PaymentStatus.Pending;
        CreatedAtUtc = DateTime.UtcNow;
    }

    public OrderId OrderId { get; private init; }
    public UserId UserId { get; private init; }
    public Money? CapturedHoldedAmount { get; private set; }
    public Money? CapturedRemainingAmount {get; private set; }
    public PaymentStatus Status { get; private set; }
    public DateTime CreatedAtUtc { get; private init; }
    public DateTime? CompletedAtUtc { get; private set; }
    public DateTime? CapturedAuthHoldAtUtc { get; private set; }

    // --- Calculated Properties ---
    public Money TotalCapturedAmount => (CapturedHoldedAmount ?? Money.Zero()) + (CapturedRemainingAmount ?? Money.Zero());


    
    // Encapsulate the collection
    public IReadOnlyCollection<Transaction> Transactions => _transactions.AsReadOnly();

    public static Result<Payment> Create(OrderId orderId, UserId userId, Money amount)
    {
        if (amount <= Money.Zero())
            return Result.Failure<Payment>(PaymentErrors.AmountMustBeGreaterThanZero);

        var paymentId = PaymentId.New();       
        
        var payment = new Payment(paymentId, orderId, userId, amount);
        
        payment.RaiseDomainEvent(new PaymentCreatedDomainEvent(paymentId, orderId));
        return Result.Success(payment);
    }

    public Result AddCapturedRemainingAmount(Money amount)
    {
        if (amount <= Money.Zero())
            return Result.Failure<Payment>(MoneyErrors.AmountTooLow);

        if (CapturedRemainingAmount is not null)
            return Result.Failure<Payment>(PaymentErrors.RemainingAmountCaptureFailed);
        
        
        this.CapturedRemainingAmount = amount;

        RaiseDomainEvent(new PaymentAmountUpdatedDomainEvent(this.Id, this.OrderId));
        return Result.Success();
    }

    // Records the intent to execute a transaction
    public Result RecordTransactionAttempt(string gatewayIntentId, TransactionType transactionType)
    {
        if (Status == PaymentStatus.Completed 
            || Status == PaymentStatus.Refunded)
        {
            return Result.Failure(PaymentErrors.AlreadyProcessed(Status));
        }

        if (_transactions.Any(t =>
            t.GatewayIntentId == gatewayIntentId &&
            t.Type == transactionType))
        {
            return Result.Failure(PaymentErrors.DuplicateTransaction);
        }

        var transactionResult =  Transaction.Create(this.Id, gatewayIntentId, transactionType);
        if (transactionResult.IsFailure) return transactionResult.TopError;

        _transactions.Add(transactionResult.Value);

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
        bool hasSuccessfulRemaningAmountCapture = _transactions.Any(t => t.Type == TransactionType.RemainingAmountCapture && t.Status == TransactionStatus.Success);
        bool hasSuccessfulCapture = _transactions.Any(t => t.Type == TransactionType.DepositCaptured && t.Status == TransactionStatus.Success);
        bool hasSuccessfulAuth = _transactions.Any(t => t.Type == TransactionType.AuthorizationHold && t.Status == TransactionStatus.Success);
        
        if (hasSuccessfulRemaningAmountCapture && Status != PaymentStatus.Completed && hasSuccessfulCapture)
        {
            Status = PaymentStatus.Completed;
            CompletedAtUtc = DateTime.UtcNow;
            RaiseDomainEvent(new PaymentCompletedDomainEvent(this.Id, this.OrderId));
        }
        
        else if (hasSuccessfulCapture && Status != PaymentStatus.Completed && Status != PaymentStatus.AuthorizedAmountCaptured)
        {
            Status = PaymentStatus.AuthorizedAmountCaptured;
            CapturedAuthHoldAtUtc = DateTime.UtcNow;
            RaiseDomainEvent(new PaymentAuthHoldedCapturedDomainEvent(this.Id, this.OrderId));
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