using MazadZone.Application.Services;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users.Errors;
using MazadZone.Domain.Users.ValueObjects;
using System.Text.RegularExpressions;
using MazadZone.Domain.Bidders;
using Microsoft.Extensions.Logging;


namespace MazadZone.Application.Features.Users.Commands.VerifyIdentity;

public class VerifyIdentityCommandHandler : ICommandHandler<VerifyIdentityCommand, Unit>
{
    private readonly IUserRepository _userRepository;
    private readonly IBidderRepository _bidderRepository;
    private readonly ISellerRepository _sellerRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IIdentityExtractionService _identityExtractionService;
    private readonly ILogger<VerifyIdentityCommandHandler> _logger;

    // Compiled regex with timeout of 250ms to prevent resource exhaustion / ReDoS.
    private static readonly Regex StandardizedIdRegex = new Regex(
        @"^\d{10,15}$", 
        RegexOptions.Compiled, 
        TimeSpan.FromMilliseconds(250));


    public VerifyIdentityCommandHandler(
        IUserRepository userRepository,
        IBidderRepository bidderRepository,
        ISellerRepository sellerRepository,
        IUnitOfWork unitOfWork,
        IIdentityExtractionService identityExtractionService,
        ILogger<VerifyIdentityCommandHandler> logger)
    {
        _userRepository = userRepository;
        _bidderRepository = bidderRepository;
        _sellerRepository = sellerRepository;
        _unitOfWork = unitOfWork;
        _identityExtractionService = identityExtractionService;
        _logger = logger;
    }

    public async Task<Result<Unit>> Handle(VerifyIdentityCommand request, CancellationToken cancellationToken)
    {
        var bidder = await _bidderRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (bidder is null)
        {
            return BidderErrors.NotFound;
        }

        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null)
        {
            return UserErrors.NotFound;
        }

        // Transition bidder state to Pending
        bidder.SubmitForVerification();
        _bidderRepository.Update(bidder);
        
        // Save pending status to persistence first to ensure visibility during processing
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        VerifyIdentityLogs.LogAttempt(_logger, request.UserId);

        // Invoke identity extraction service
        var extractionResult = await _identityExtractionService.ExtractDataAsync(request.ImageBytes);

        if (!extractionResult.Success || string.IsNullOrWhiteSpace(extractionResult.NationalId))
        {
            var reason = extractionResult.ErrorMessage ?? "Failed to extract text from ID card image.";
            VerifyIdentityLogs.LogRejected(_logger, request.UserId, reason);
            
            bidder.RejectVerification(reason);
            _bidderRepository.Update(bidder);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            return Result.Failure<Unit>(Error.Validation("Identity.ExtractionFailed", reason));
        }

        // Apply domain logic assertions: Check if extracted NationalId precisely fits standard format
        if (!StandardizedIdRegex.IsMatch(extractionResult.NationalId))
        {
            var reason = $"Extracted National ID '{extractionResult.NationalId}' is invalid. Must be a numeric value of 10 to 15 digits.";
            VerifyIdentityLogs.LogRejected(_logger, request.UserId, reason);
            
            bidder.RejectVerification(reason);
            _bidderRepository.Update(bidder);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            return Result.Failure<Unit>(Error.Validation("Identity.InvalidNationalIdFormat", reason));
        }

        // Verify name matches entered name with lenient comparison
        var enteredFullName = user.FullName.GetDisplayName();

        // Log extracted names for server-side debugging
        _logger.LogInformation(
            "OCR extraction result for identity verification - UserId: {UserId}, Profile name: '{ProfileName}', OCR English: '{EnglishName}', OCR Arabic: '{ArabicName}'",
            request.UserId,
            enteredFullName,
            extractionResult.EnglishFullName,
            extractionResult.ArabicFullName);

        bool nameMatches = false;
        if (!string.IsNullOrWhiteSpace(extractionResult.EnglishFullName))
        {
            var normalizedExtracted = NormalizeNameForComparison(extractionResult.EnglishFullName);
            var normalizedEntered = NormalizeNameForComparison(enteredFullName ?? "");
            nameMatches = string.Equals(normalizedExtracted, normalizedEntered, StringComparison.OrdinalIgnoreCase);
        }

        if (!nameMatches && !string.IsNullOrWhiteSpace(extractionResult.ArabicFullName))
        {
            var normalizedExtracted = NormalizeNameForComparison(extractionResult.ArabicFullName);
            var normalizedEntered = NormalizeNameForComparison(enteredFullName ?? "");
            nameMatches = string.Equals(normalizedExtracted, normalizedEntered, StringComparison.OrdinalIgnoreCase);
        }

        if (!nameMatches)
        {
            _logger.LogWarning(
                "Name mismatch during identity verification - UserId: {UserId}. Profile: '{ProfileName}', OCR English: '{EnglishName}', OCR Arabic: '{ArabicName}'",
                request.UserId,
                enteredFullName,
                extractionResult.EnglishFullName,
                extractionResult.ArabicFullName);

            var reason = $"The name on the identity card does not match your profile name: '{enteredFullName}'.";
            VerifyIdentityLogs.LogRejected(_logger, request.UserId, reason);
            
            bidder.RejectVerification(reason);
            _bidderRepository.Update(bidder);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            
            return Result.Failure<Unit>(Error.Validation("Identity.NameMismatch", reason));
        }

        // Update bidder verification status to Verified using strictly the extracted name (preferring English first)
        var extractedFullName = !string.IsNullOrWhiteSpace(extractionResult.EnglishFullName) ? extractionResult.EnglishFullName :
                                !string.IsNullOrWhiteSpace(extractionResult.ArabicFullName) ? extractionResult.ArabicFullName : 
                                "Unknown (OCR Failed to read name)";
        bidder.ApproveVerification(extractionResult.NationalId, extractedFullName);
        _bidderRepository.Update(bidder);

        // Update associated Seller profile if it exists
        var seller = await _sellerRepository.GetByIdAsync(user.Id, cancellationToken);
        if (seller != null)
        {
            seller.Verify();
            _sellerRepository.Update(seller);
        }

        await _unitOfWork.SaveChangesAsync(cancellationToken);
        
        VerifyIdentityLogs.LogSuccess(_logger, request.UserId);

        return Unit.Value;
    }

    /// <summary>
    /// Strips all non-letter characters (hyphens, apostrophes, spaces, digits, punctuation)
    /// so that OCR variations like "AL-MAHDAWI", "AL MAHDAWI", and "AL_MAHDAWI" all match.
    /// Preserves Latin (A-Z, a-z) and Arabic script letters only.
    /// </summary>
    private static string NormalizeNameForComparison(string name)
    {
        if (string.IsNullOrEmpty(name)) return string.Empty;
        return Regex.Replace(name, @"[^a-zA-Z\u0600-\u06FF]", "");
    }
}
