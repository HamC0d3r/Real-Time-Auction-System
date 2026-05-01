using MazadZone.Domain.Auctions;

namespace MazadZone.Domain.Items;

public static class ItemErrorCodes
{
    public const string TooManyImages = "Item.TooManyImages";
    public const string EmptyImagePath = "Item.EmptyImagePath";
    public const string ImageNotFound = "Item.ImageNotFound";
    public const string ImageAlreadyExists = "Item.ImageAlreadyExists";
public const string InvalidTitle = "Item.InvalidTitle";
    public const string InvalidDescription = "Item.InvalidDescription";
}

public static class ItemErrors
{
    public static readonly Error TooManyImages = Error.Conflict(
        ItemErrorCodes.TooManyImages,
        $"An item cannot have more than {AuctionConstants.MaxImagesPerItem} images."
    );

    public static readonly Error EmptyImagePath = Error.Validation(
        ItemErrorCodes.EmptyImagePath,
        "Image path cannot be empty."
    );

    public static readonly Error ImageNotFound = Error.NotFound(
        ItemErrorCodes.ImageNotFound,
        "The specified image was not found on this item."
    );

    public static readonly Error ImageAlreadyExists = Error.Conflict(
        ItemErrorCodes.ImageAlreadyExists,
        "An image with this exact path already exists on this item."
    );

public static readonly Error InvalidTitle = Error.Validation(
        ItemErrorCodes.InvalidTitle,
        $"The item title cannot be empty and must not exceed {AuctionConstants.MaxTitleLength} characters."
    );

    public static readonly Error InvalidDescription = Error.Validation(
        ItemErrorCodes.InvalidDescription,
        $"The item description cannot be empty and must not exceed {AuctionConstants.MaxDescriptionLength} characters."
    );
}