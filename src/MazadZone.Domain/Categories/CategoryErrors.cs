namespace MazadZone.Domain.Categories;

public static class CategoryErrorCodes
{
    public const string AlreadyDeleted = "Category.AlreadyDeleted";
    public const string NotDeleted = "Category.NotDeleted";

    public const string SelfReference = "Category.SelfReference";
    public const string InvalidParent = "Category.InvalidParent";
    public const string AlreadyExists = "Category.AlreadyExists";
    public const string AlreadyRoot = "Category.AlreadyRoot";
    
    public const string NotFound = "Category.NotFound";
}

public static class CategoryErrors
{
    public static readonly Error AlreadyDeleted = Error.Conflict(
        CategoryErrorCodes.AlreadyDeleted,
        "The category has already been deleted.");

    public static readonly Error NotDeleted = Error.Conflict(
        CategoryErrorCodes.NotDeleted,
        "The category is currently active and is not deleted.");

    public static readonly Error SelfReference = Error.Conflict(
        CategoryErrorCodes.SelfReference,
        "A category cannot be assigned as its own parent.");

    public static readonly Error InvalidParent = Error.Validation(
        CategoryErrorCodes.InvalidParent,
        "The provided sub-category does not have this category set as its parent.");

    public static readonly Error AlreadyExists = Error.Conflict(
        CategoryErrorCodes.AlreadyExists,
        "This sub-category is already a child of this category.");

    public static readonly Error AlreadyRoot = Error.Conflict(
        CategoryErrorCodes.AlreadyRoot,
        "This category is already a root category (it has no parent).");
        
    public static readonly Error NotFound = Error.NotFound(
        CategoryErrorCodes.NotFound,
        "The specified category was not found.");
}