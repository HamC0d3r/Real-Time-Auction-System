// using MazadZone.Domain.Auctions;
// using MazadZone.Domain.Items;
// using MazadZone.Domain.Repositories;
// using MazadZone.Domain.ValueObjects;

// namespace MazadZone.Application.Features.Listings.CreateListing;
// public sealed class CreateListingHandler : IRequestHandler<CreateListingCommand, Result<Guid>>
// {
//     private readonly IItemRepository _itemRepository;
//     private readonly IAuctionRepository _auctionRepository;
//     private readonly IUnitOfWork _unitOfWork;

//     public CreateListingHandler(IItemRepository itemRepo, IAuctionRepository auctionRepo, IUnitOfWork uow)
//     {
//         _itemRepository = itemRepo;
//         _auctionRepository = auctionRepo;
//         _unitOfWork = uow;
//     }

//     public async Task<Result<Guid>> Handle(CreateListingCommand request, CancellationToken ct)
//     {
//         // 1. Create the Item
//         var itemResult = Item.Create(new SellerId(request.SellerId), new CategoryId(request.CategoryId), request.Title, request.Description);
//         if (itemResult.IsFailure) return itemResult.TopError;

//         var item = itemResult.Value;
//         request.ImagePaths.ForEach(path => item.AddImage(Image.Create(path, request.Title).Value));

//         // 2. Create the Auction linking to the new Item
//         var auctionResult = Auction.Create(
//             item.Id,
//             new SellerId(request.SellerId),
//             new AddressId(request.ShippingAddressId),
//             request.StartBidAmount,
//             request.MinBidAmount,
//             Currency.Jod,
//             request.StartTime,
//             request.EndTime);

//         if (auctionResult.IsFailure) return auctionResult.TopError;

//         // 3. Persist Both
//         _itemRepository.Add(item);
//         _auctionRepository.Add(auctionResult.Value);
        
//         await _unitOfWork.SaveChangesAsync(ct);
//         return Result.Success(auctionResult.Value.Id.Value);
//     }
// }