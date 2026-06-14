using MazadZone.Application.Features.Authentication.DTOs;
using MazadZone.Application.Features.Bidders.DTOs;
using MazadZone.Application.Services;
using MazadZone.Domain.Bidders;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users;
using MazadZone.Domain.Users.Errors;

namespace MazadZone.Application.Features.Bidders.Commands.Register;

public class RegisterBidderCommandHandler : ICommandHandler<RegisterBidderCommand, RegisterBidderDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;
    private readonly IBidderRepository _bidderRepository;
    private readonly IPasswordService _passwordService;
    private readonly ITokenProvider _tokenProvider;
    private readonly IIdentityExtractionService _identityExtractionService;
    private readonly ILogger<RegisterBidderCommandHandler> _logger;

    private static readonly System.Text.RegularExpressions.Regex StandardizedIdRegex = 
        new System.Text.RegularExpressions.Regex(
            @"^\d{10,15}$", 
            System.Text.RegularExpressions.RegexOptions.Compiled, 
            TimeSpan.FromMilliseconds(250));

    public RegisterBidderCommandHandler(
        IUnitOfWork unitOfWork,
        IPasswordService passwordService,
        ITokenProvider tokenProvider,
        IUserRepository userRepository,
        IBidderRepository bidderRepository,
        IIdentityExtractionService identityExtractionService,
        ILogger<RegisterBidderCommandHandler> logger
    )
    {
        _unitOfWork = unitOfWork;
        _userRepository = userRepository;
        _bidderRepository = bidderRepository;
        _passwordService = passwordService;
        _tokenProvider = tokenProvider;
        _identityExtractionService = identityExtractionService;
        _logger = logger;
    }

    public async Task<Result<RegisterBidderDto>> Handle(
        RegisterBidderCommand request, CancellationToken ct)
    {
        var emailResult = Email.Create(request.Email);
        if (emailResult.IsFailure) return emailResult.TopError;

        if (await _userRepository.IsEmailInUseAsync(emailResult.Value, ct))
        {
            _logger.LogEmailConflict(EmailErrorCodes.AlreadyInUse, request.Email);
            return EmailErrors.AlreadyInUse;
        }

        // Perform Google Cloud Vision identity extraction & verification
        if (request.IdentityCardImageBytes == null || request.IdentityCardImageBytes.Length == 0)
        {
            return Result.Failure<RegisterBidderDto>(Error.Validation("Identity.ImageRequired", "An image file of the identity card is required."));
        }

        var extractionResult = await _identityExtractionService.ExtractDataAsync(request.IdentityCardImageBytes);
        if (!extractionResult.Success || string.IsNullOrWhiteSpace(extractionResult.NationalId))
        {
            var extractionReason = extractionResult.ErrorMessage ?? "Failed to extract text from ID card image.";
            return Result.Failure<RegisterBidderDto>(Error.Validation("Identity.ExtractionFailed", extractionReason));
        }

        if (!StandardizedIdRegex.IsMatch(extractionResult.NationalId))
        {
            return Result.Failure<RegisterBidderDto>(Error.Validation(
                "Identity.InvalidNationalIdFormat", 
                $"Extracted National ID '{extractionResult.NationalId}' is invalid. Must be a numeric value of 10 to 15 digits."));
        }

        if (extractionResult.NationalId != request.NationalId)
        {
            return Result.Failure<RegisterBidderDto>(Error.Validation(
                "Identity.NationalIdMismatch", 
                "The national ID extracted from the card does not match the provided national ID."));
        }

        var enteredFullName = string.Join(" ", new[] { request.FirstName, request.SecondName, request.ThirdName, request.LastName }
            .Where(p => !string.IsNullOrWhiteSpace(p)))
            .Trim();

        // Log extracted names for server-side debugging
        _logger.LogInformation(
            "OCR extraction result for registration - Entered: '{EnteredName}', OCR English: '{EnglishName}', OCR Arabic: '{ArabicName}'",
            enteredFullName,
            extractionResult.EnglishFullName,
            extractionResult.ArabicFullName);

        bool nameMatches = false;
        if (!string.IsNullOrWhiteSpace(extractionResult.EnglishFullName))
        {
            var normalizedExtracted = NormalizeNameForComparison(extractionResult.EnglishFullName);
            var normalizedEntered = NormalizeNameForComparison(enteredFullName);
            nameMatches = string.Equals(normalizedExtracted, normalizedEntered, StringComparison.OrdinalIgnoreCase);
        }

        if (!nameMatches && !string.IsNullOrWhiteSpace(extractionResult.ArabicFullName))
        {
            var normalizedExtracted = NormalizeNameForComparison(extractionResult.ArabicFullName);
            var normalizedEntered = NormalizeNameForComparison(enteredFullName);
            nameMatches = string.Equals(normalizedExtracted, normalizedEntered, StringComparison.OrdinalIgnoreCase);
        }

        if (!nameMatches)
        {
            _logger.LogWarning(
                "Name mismatch during registration. Entered: '{EnteredName}', OCR English: '{EnglishName}', OCR Arabic: '{ArabicName}'",
                enteredFullName,
                extractionResult.EnglishFullName,
                extractionResult.ArabicFullName);

            return Result.Failure<RegisterBidderDto>(Error.Validation(
                "Identity.NameMismatch", 
                $"The name on the identity card does not match the entered name: '{enteredFullName}'."));
        }

        if(await _bidderRepository.IsNationalIdInUseAsync(request.NationalId, ct))
        {
            // _logger.LogNationalIdConflict(NationalIdErrorCodes.AlreadyInUse, request.NationalId);
            return UserErrors.NationalIdAlreadyExists;
        }

        var newUserResult = _CreateUser(request);
        if (newUserResult.IsFailure)
        {
            return newUserResult.TopError;
        }

        var newUser = newUserResult.Value;
        newUser.AddBidderRole();

        var bidderResult = Bidder.CompleteProfile(newUser.Id, request.NationalId, request.Address.ToAddress());
        if (bidderResult.IsFailure)
        {
            return bidderResult.TopError;
        }

        var newBidder = bidderResult.Value;
        
        // Approve verification on the Bidder entity using strictly the extracted name (preferring English first)
        var extractedFullName = !string.IsNullOrWhiteSpace(extractionResult.EnglishFullName) ? extractionResult.EnglishFullName :
                                !string.IsNullOrWhiteSpace(extractionResult.ArabicFullName) ? extractionResult.ArabicFullName : 
                                "Unknown (OCR Failed to read name)";
        newBidder.ApproveVerification(extractionResult.NationalId, extractedFullName);

        var accessToken = _tokenProvider.GenerateAccessToken(newUser);
        var refreshTokenRaw = _tokenProvider.GenerateRefreshToken();
        var hashedRefreshToken = _tokenProvider.HashToken(refreshTokenRaw);

        newUser.AddRefreshToken(hashedRefreshToken);

        _userRepository.Add(newUser);
        _bidderRepository.Add(newBidder);

        await _unitOfWork.SaveChangesAsync(ct);

        _logger.LogInformation("Registration completed successfully. UserId: {UserId}, Email: {Email}.", newUser.Id, newUser.Email);


        var profile = CreateBidderProfile(newUser, bidderResult.Value);
        var tokenInfo = new TokenDto(accessToken, refreshTokenRaw);

        return new RegisterBidderDto(profile, tokenInfo);
    }

    private Result<User> _CreateUser(RegisterBidderCommand request)
    {
        return User.Create(
            email: request.Email,
            passwordHash: _passwordService.HashPassword(request.Password),
            phoneNumber: request.PhoneNumber,
            firstName: request.FirstName,
            secondName: request.SecondName,
            thirdName: request.ThirdName,
            lastName: request.LastName,
            roles:  UserRole.Bidder 
            );

    }

    /// <summary>
    /// Strips all non-letter characters (hyphens, apostrophes, spaces, digits, punctuation)
    /// so that OCR variations like "AL-MAHDAWI", "AL MAHDAWI", and "AL_MAHDAWI" all match.
    /// Preserves Latin (A-Z, a-z) and Arabic script letters only.
    /// </summary>
    private static string NormalizeNameForComparison(string name)
    {
        if (string.IsNullOrEmpty(name)) return string.Empty;
        return System.Text.RegularExpressions.Regex.Replace(name, @"[^a-zA-Z\u0600-\u06FF]", "");
    }

    private BidderProfileDto CreateBidderProfile(User user, Bidder bidder)
{
    return new BidderProfileDto(
        Id: user.Id.Value,
        FullName: user.FullName.GetDisplayName(),
        Email: user.Email.Value,
        PhoneNumber: user.PhoneNumber.Value,
        Status: user.Status.ToString(), // Adjust this based on your UserStatus enum/smart enum implementation
        IsVerified: bidder.IsVerified,
        MemberSince: user.CreatedOnUtc,
        LastLogin: user.LastLogin,
        bidder.DefaultShippingAddress.City,
        bidder.DefaultShippingAddress.Street,
        bidder.DefaultShippingAddress.Building,
        bidder.DefaultShippingAddress.Landmark,
        TotalBidsPlaced: bidder.TotalPidsPlaced, // Using the property name from your Bidder entity
        AuctionParticipatedCount: bidder.AuctionParticipatedCount,
        AuctionsWonCount: bidder.AuctionsWonCount,
        CompletedPurchasesCount: bidder.CompletedPurchasesCount
    );
}

}
