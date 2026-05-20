namespace MazadZone.Domain.Shared.ValueObjects;

public sealed record Image 
{
    public string Path { get; }
    public string? AltText { get; }
    public bool isMain { get; init; } // This can be used to maintain the order of images if needed

    public static Result<Image> Create(string path, string? altText, bool? isMain = null)
    {
        if (string.IsNullOrWhiteSpace(path)) 
            throw new ArgumentException("Image path cannot be null or empty.", nameof(path));

        return new Image(path, altText, isMain);
    }

    private Image(string path, string? altText, bool? isMain)
    {
        Path = path;
        AltText = altText ?? string.Empty; // Alt text can technically be empty, but never null
        isMain = isMain ?? false;
    }
}