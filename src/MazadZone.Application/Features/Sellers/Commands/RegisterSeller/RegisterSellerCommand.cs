// using MazadZone.Domain.Auctions;

// namespace MazadZone.Application.Features.Sellers.Commands;

// public record RegisterSellerCommand(Guid UserId, string BankAccountNumber) : IRequest<Result<Guid>>;

// public class RegisterSellerCommandHandler : IRequestHandler<RegisterSellerCommand, Result<Guid>>
// {
//     private readonly IBidderRepository _bidderRepository;
//     private readonly ISellerRepository _sellerRepository;
//     private readonly IUnitOfWork _unitOfWork;

//     public RegisterSellerCommandHandler(
//         IBidderRepository bidderRepository, 
//         ISellerRepository sellerRepository,
//         IUnitOfWork unitOfWork)
//     {
//         _bidderRepository = bidderRepository;
//         _sellerRepository = sellerRepository;
//         _unitOfWork = unitOfWork;
//     }

//     public async Task<Result<Guid>> Handle(RegisterSellerCommand request, CancellationToken ct)
//     {
//         var bidderId = new BidderId(request.UserId);

//         // 1. BUSINESS RULE ENFORCEMENT: Does the Bidder exist?
//         var isAlreadyBidder = await _bidderRepository.ExistsAsync(bidderId, ct);
//         if (!isAlreadyBidder)
//         {
//             return Result.Failure<Guid>(new Error(
//                 "Seller.RequiresBidderProfile", 
//                 "You must complete your Bidder profile (shipping address, etc.) before registering as a Seller."));
//         }

//         // 2. IDEMPOTENCY CHECK: Are they already a Seller?
//         var sellerId = new SellerId(request.UserId);
//         var isAlreadySeller = await _sellerRepository.ExistsAsync(sellerId, ct);
//         if (isAlreadySeller)
//         {
//             return Result.Failure<Guid>(new Error(
//                 "Seller.AlreadyRegistered", 
//                 "This user is already registered as a Seller."));
//         }

//         // 3. CREATE AGGREGATE: Safe to proceed
//         var sellerResult = Seller.BecomeSeller(bidderId, request.BankAccountNumber);
//         if (sellerResult.IsFailure) 
//             return Result.Failure<Guid>(sellerResult.Error);

//         // 4. PERSIST
//         await _sellerRepository.AddAsync(sellerResult.Value, ct);
//         await _unitOfWork.SaveChangesAsync(ct);

//         // Return the primitive Guid to the API endpoint
//         return sellerResult.Value.Id.Value; 
//     }
// }