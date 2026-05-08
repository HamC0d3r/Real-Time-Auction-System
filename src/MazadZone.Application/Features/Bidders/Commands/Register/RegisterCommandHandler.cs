using AuthService.Application.Interfaces;
using AutoMapper;
using MazadZone.Application.Features.Authentication.DTOs;
using MazadZone.Application.Features.Bidders.DTOs;
using MazadZone.Application.Services;
using MazadZone.Domain.Bidders;
using MazadZone.Domain.Entities.Users;
using MazadZone.Domain.Repositories;
using MazadZone.Domain.Users;

namespace MazadZone.Application.Features.Bidders.Commands.Register;

public class RegisterBidderCommandHandler : ICommandHandler<RegisterBidderCommand, RegisterBidderDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IUserRepository _userRepository;
    private readonly IBidderRepository _bidderRepository;
    private readonly IPasswordService _passwordService;
    private readonly ITokenProvider _tokenProvider;
    private readonly ILogger<RegisterBidderCommandHandler> _logger;
    private readonly IMapper _mapper;

    public RegisterBidderCommandHandler(
        IUnitOfWork unitOfWork,
        IPasswordService passwordService,
        ITokenProvider tokenProvider,
        IUserRepository userRepository,
        IBidderRepository bidderRepository,
        IMapper mapper,
        ILogger<RegisterBidderCommandHandler> logger
    )
    {
        _unitOfWork = unitOfWork;
        _userRepository = userRepository;
        _bidderRepository = bidderRepository;
        _passwordService = passwordService;
        _tokenProvider = tokenProvider;
        _logger = logger;
        _mapper = mapper;
    }

    async Task<Result<RegisterBidderDto>> IRequestHandler<RegisterBidderCommand, Result<RegisterBidderDto>>.Handle(
        RegisterBidderCommand request, CancellationToken ct)
    {
        var emailResult = Email.Create(request.Email);
        if (emailResult.IsFailure) return emailResult.TopError;

        if (await _userRepository.IsEmailInUseAsync(emailResult.Value, ct))
        {
            // _logger.LogEmailConflict(EmailErrorCodes.AlreadyInUse, request.Email);
            return EmailErrors.AlreadyInUse;
        }

        var newUserResult = _CreateUser(request);
        if (newUserResult.IsFailure)
        {
            return newUserResult.TopError;
        }

        var newUser = newUserResult.Value;

        var bidderResult = Bidder.CompleteProfile(newUser.Id,request.NationalId, _mapper.Map<Address>(request.Address));
        if (bidderResult.IsFailure)
        {
            return bidderResult.TopError;
        }

        var newBidder = bidderResult.Value;


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
            roles: new HashSet<UserRole> { UserRole.Bidder }
            );

    }

    private BidderProfileDto CreateBidderProfile(User user, Bidder bidder)
    {
        return new BidderProfileDto(
            bidder.Id,
            user.FullName.GetDisplayName(),
            user.Email.Value,
            user.PhoneNumber.Value,
             _mapper.Map<AddressDto>(bidder.DefaultShippingAddress),
            0,
            0,
            user.CreatedOnUtc);

    }

}
