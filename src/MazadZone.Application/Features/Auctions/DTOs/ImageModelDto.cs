namespace MazadZone.Application.Features.Auctions.DTOs;

public record ImageModelDto
{
    public string Path { get; set; }
    public string AltText { get; set; }
    public bool isMain { get; set; }
}
