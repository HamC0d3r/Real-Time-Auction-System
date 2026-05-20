namespace MazadZone.Domain.Auctions;

using System.Collections.Generic;
using System.Runtime.CompilerServices;
using MazadZone.Domain.Auctions.ValueObjects;
using MazadZone.Domain.Categories;
using MazadZone.Domain.Items;
using MazadZone.Domain.Primitives;
using MazadZone.Domain.Shared.ValueObjects;

public sealed class Item : Entity<ItemId>
{
    private readonly List<Image> _images = new();

    #pragma warning disable CS8618
    #pragma warning disable CS0519
    private Item() { }
    #pragma warning restore CS8618


    private Item(
        ItemId id,
        CategoryId categoryId,
        string title,
         Description description) : base(id)
    {
        CategoryId = categoryId;
        Title = title;
        Description = description;
    }

    // --- Properties ---
    public CategoryId CategoryId { get; private init; }
    public string Title { get; private set; }
    public Description Description { get; private set; }

    // Encapsulated collection
    public IReadOnlyCollection<Image> Images => _images.AsReadOnly();

    // --- Factory Method ---
    public static Result <Item> Create(
        CategoryId categoryId,
        string title,
        string description,
        List<Image> images
    )
    {
        if (string.IsNullOrWhiteSpace(title) || title.Length > AuctionConstants.MaxTitleLength)
            return ItemErrors.InvalidTitle;

        var descriptionResult = Description.Create(description);
        if (descriptionResult.IsFailure)
            return ItemErrors.InvalidDescription;
        
        foreach (var image in images)
        {
            var imageResult = Image.Create(image.Path, image.AltText,image.isMain);
            
            if (imageResult.IsFailure)
                return imageResult.TopError;
        }

        return new Item(
            ItemId.New(),
            categoryId,
            title,
            descriptionResult.Value
        );
    }

    // --- Behaviors / Operations ---

public Result AddImage(Image image)
    {
        // 1. Check max limits
        if (_images.Count >= AuctionConstants.MaxImagesPerItem)
            return ItemErrors.TooManyImages;

        // 2. Prevent duplicate paths
        if (_images.Any(i => i.Path == image.Path))
            return ItemErrors.ImageAlreadyExists;

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

        var descriptionResult = Description.Create(newDescription);
        if (descriptionResult.IsFailure) 
        return ItemErrors.InvalidDescription;

        Title = newTitle;
        Description = descriptionResult.Value;

        return Result.Success();
    }
}