namespace MazadZone.Domain.Items;

public sealed record Image
{
    public string Path { get; }
    public string? AltText { get; }

    public static Result<Image> Create(string path, string? altText)
    {
        if (string.IsNullOrWhiteSpace(path)) return ItemErrors.EmptyImagePath;

        return new Image(path, altText);
    }

    private Image(string path, string? altText)
    {
        Path = path;
        AltText = altText ?? string.Empty; // Alt text can technically be empty, but never null
    }
}