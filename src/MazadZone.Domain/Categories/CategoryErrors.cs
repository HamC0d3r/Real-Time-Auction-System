namespace MazadZone.Domain.Categories;

public static class CategoryErrorsCodes
{
    public const string NotFound = "Category.NotFound";

    public const string InvalidName = "Category.InvalidName";

    public const string InvalidParentCategory = "Category.InvalidParentCategory";

    
}
public static class CategoryErrors
{
    public static readonly Error NotFound = Error.NotFound
    (CategoryErrorsCodes.NotFound, 
    "The specified category was not found.");

    public static readonly Error InvalidName = 
    Error.Validation(CategoryErrorsCodes.InvalidName,
    "Category name cannot be empty or whitespace.");

    public static readonly Error InvalidParentCategory = 
    Error.Validation(CategoryErrorsCodes.InvalidParentCategory,
    "The specified parent category is invalid.");
}