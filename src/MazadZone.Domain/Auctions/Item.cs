namespace MazadZone.Domain.Auctions;

using MazadZone.Domain.Items;
using MazadZone.Domain.Primitives;

public sealed class Item : AggregateRoot<ItemId>
{
    private readonly List<Image> _images = new();

    private Item() { }

    private Item(
        ItemId id,
        // SellerId sellerId,
        CategoryId categoryId,
        string title,
         string description) : base(id)
    {
        // SellerId = sellerId;
        CategoryId = categoryId;
        Title = title;
        Description = description;
    }

    // --- Properties ---
    // public SellerId SellerId { get; private init; }
    public CategoryId CategoryId { get; private init; }
    public string Title { get; private set; }
    public string Description { get; private set; }

    // Encapsulated collection
    public IReadOnlyCollection<Image> Images => _images.AsReadOnly();

    // --- Factory Method ---
    public static Result <Item> Create(
        SellerId sellerId,
        CategoryId categoryId,
        string title,
        string description
    )
    {
        if (string.IsNullOrWhiteSpace(title) || title.Length > AuctionConstants.MaxTitleLength)
            return ItemErrors.InvalidTitle;

            if (string.IsNullOrWhiteSpace(description) || description.Length > AuctionConstants.MaxDescriptionLength)
            return ItemErrors.InvalidDescription;


        // You could add validation here (e.g., title max length)
        return new Item(new ItemId(Guid.NewGuid()), // sellerId,
        categoryId, title, description);
    }

    // --- Behaviors / Operations ---

public Result AddImage(Image image)
    {
        // 1. Check max limits
        if (_images.Count >= AuctionConstants.MaxImagesPerItem)
            return Result.Failure(ItemErrors.TooManyImages);

        // 2. Prevent duplicate paths
        if (_images.Any(i => i.Path == image.Path))
            return Result.Failure(ItemErrors.ImageAlreadyExists);

        _images.Add(image);
        return Result.Success();
    }


    public Result AddImages(IEnumerable<Image> images)
    {
        if (_images.Count + images.Count() > AuctionConstants.MaxDescriptionLength)
            return ItemErrors.TooManyImages;


        _images.AddRange(images);
        return Result.Success();
    }

    public Result DeleteImages(IEnumerable<string> imagesPathsToRemove)
    {
        //  Conver to HashSet for O(1) lookups
        var pathsSet = imagesPathsToRemove.ToHashSet();

        // Remove images whose paths are in the provided list
        _images.RemoveAll(img => pathsSet.Contains(img.Path));

        return Result.Success();
    }


        public Result DeleteImage(string  path)
    {
        // Find the image by its unique Path
        var existingImage = _images.FirstOrDefault(i => i.Path == path);
        
        if (existingImage is null) return ItemErrors.ImageNotFound;

        _images.Remove(existingImage);
        return Result.Success();
    }

    public Result UpdateImage(string oldImagePath, Image newImage)
    {
        // 1. Find the old image by Path
        var existingImage = _images.FirstOrDefault(i => i.Path == oldImagePath);

        if (existingImage is null) return ItemErrors.ImageNotFound;

        // 2. Value Objects are immutable. You don't "update" them.
        // You remove the old one and add the new one.
        _images.Remove(existingImage);
        _images.Add(newImage);

        return Result.Success();
    }
    

    public Result UpdateDetails(string newTitle, string newDescription)
    {
        if (string.IsNullOrWhiteSpace(newTitle) || newTitle.Length > AuctionConstants.MaxTitleLength)
            return ItemErrors.InvalidTitle;

        if (string.IsNullOrWhiteSpace(newDescription) || newDescription.Length > AuctionConstants.MaxDescriptionLength)
            return ItemErrors.InvalidDescription;

        Title = newTitle;
        Description = newDescription;

        return Result.Success();
    }
}