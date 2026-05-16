using MazadZone.Application.Services;
using MazadZone.Domain.Payments.Errors;
using MazadZone.Domain.Repositories;
using MzadZone.Domain.Payments.Entities;

namespace MazadZone.Application.Features.Payments.Commands.CaptureRemainingAmount;
/// <summary>
/// Handles the command to capture the remaining amount for a payment. This involves calculating the remaining amount based on the final winning bid and the already captured hold amount, then using the payment service to capture this remaining amount. The handler also updates the payment record with the new transaction details and logs the process at each step, including attempts, successes, and failures. If any step fails, appropriate error messages are logged and returned.
/// </summary> 
/// <param name="request">The command containing the order ID for which to capture the remaining amount.</param>
/// <param name="ct">Cancellation token for the operation.</param>
/// returns>A result indicating success or failure of the capture operation.</returns>
public class CaptureRemainingAmountCommandHandler : ICommandHandler<CaptureRemainingAmountCommand, Unit>
{
    private readonly IOrderQueries _orderQueries;
    private readonly IAuctionQueries _auctionQueries;
    private readonly IPaymentRepository _paymentRepository;
    private readonly IPaymentService _paymentService;
    private readonly ILogger<CaptureRemainingAmountCommandHandler> _logger;

    public CaptureRemainingAmountCommandHandler(
        IOrderQueries orderQueries,
        IAuctionQueries auctionQueries,
        IPaymentRepository paymentRepository,
        IPaymentService paymentService,
        ILogger<CaptureRemainingAmountCommandHandler> logger)
    {
        _orderQueries = orderQueries;
        _auctionQueries = auctionQueries;
        _paymentRepository = paymentRepository;
        _paymentService = paymentService;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(CaptureRemainingAmountCommand request, CancellationToken ct)
    {
        CaptureRemainingAmountLogs.LogAttempt(_logger, request.OrderId);

        var payment = await _orderQueries.GetPaymentByOrderIdAsync(request.OrderId);

        if (payment is null)
        {
            CaptureRemainingAmountLogs.LogPaymentNotFound(
                _logger,
                request.OrderId);

            return PaymentErrors.PaymentNotFound;
        }

        var finalAmount = await _auctionQueries.GetWinningBidAmountByOrderIdAsync(request.OrderId.Value, ct);
        var remainingAmount = finalAmount - payment.CapturedHoldedAmount;

        var gatewayRemainingAmountId = await _paymentService.CaptureRemainingAmountAsync(payment, remainingAmount, ct);
        if (string.IsNullOrEmpty(gatewayRemainingAmountId))
        {
            CaptureRemainingAmountLogs.LogCaptureFailed(_logger, request.OrderId);
            return PaymentErrors.RemainingAmountCaptureFailed;
        }

        var result = payment.RecordTransactionAttempt(
            gatewayRemainingAmountId,
            TransactionType.RemainingAmountCapture
        );

        if (result.IsFailure)
        {
            CaptureRemainingAmountLogs.LogFailure(_logger, request.OrderId, result.TopError.Message);
  
            return result.TopError;
        }

        var resolveResult = payment.ResolveTransactionSuccess(gatewayRemainingAmountId);
        
        if (resolveResult.IsFailure)
        {
            payment.ResolveTransactionFailure(
                gatewayRemainingAmountId,
                resolveResult.TopError.Message);

            CaptureRemainingAmountLogs.LogFailure(
                _logger,
                request.OrderId,
                resolveResult.TopError.Message);

            return resolveResult.TopError;
        }

        var addRemainingAmountResult = payment.AddCapturedRemainingAmount(remainingAmount);
        if (addRemainingAmountResult.IsFailure)
        {
            payment.ResolveTransactionFailure(
                gatewayRemainingAmountId,
                addRemainingAmountResult.TopError.Message);

            CaptureRemainingAmountLogs.LogFailure(
                _logger,
                request.OrderId,
                addRemainingAmountResult.TopError.Message);

            return addRemainingAmountResult.TopError;
        }
        _paymentRepository.Update(payment);

        CaptureRemainingAmountLogs.LogSuccess(_logger, request.OrderId);

        return Unit.Value;
    }
}
