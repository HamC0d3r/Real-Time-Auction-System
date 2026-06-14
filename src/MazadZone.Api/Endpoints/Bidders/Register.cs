using MazadZone.Application.Features.Bidders.Commands.Register;
using MazadZone.Application.Features.Bidders.DTOs;

namespace MazadZone.Api.Endpoints.Bidders;

public static class Register
{
    public static void MapEndpoint(IEndpointRouteBuilder app)
    {
        app.MapPost("/register", HandleAsync)
            .AllowAnonymous()
            .DisableAntiforgery() // Disable anti-forgery check for multi-part forms
            .WithSummary("Register a new bidder")
            .WithDescription("Creates a new bidder account using personal details, national ID, and address, verifying identity via ID card image OCR.")
            .Produces<RegisterBidderDto>(StatusCodes.Status200OK)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .ProducesProblem(StatusCodes.Status500InternalServerError);
    }

    private static async Task<IResult> HandleAsync(
        [FromForm] string email,
        [FromForm] string password,
        [FromForm] string phoneNumber,
        [FromForm] string nationalId,
        [FromForm] string firstName,
        [FromForm] string secondName,
        [FromForm] string thirdName,
        [FromForm] string lastName,
        [FromForm] string city,
        [FromForm] string street,
        [FromForm] string building,
        [FromForm] string landmark,
        IFormFile file,
        [FromServices] ISender sender,
        CancellationToken ct)
    {
        // Enforce 5MB upload size limit to prevent Buffer Overflow or DoS attacks
        if (file.Length > 5 * 1024 * 1024)
        {
            return Results.BadRequest("File size must not exceed 5MB.");
        }

        // Validate allowed image formats (allowlist)
        var allowedExtensions = new[] { ".png", ".jpg", ".jpeg" };
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(extension))
        {
            return Results.BadRequest("Only JPG, JPEG, and PNG images are permitted.");
        }

        using var memoryStream = new MemoryStream();
        await file.CopyToAsync(memoryStream, ct);
        var imageBytes = memoryStream.ToArray();

        var address = new AddressDto(city, street, building, landmark);
        var command = new RegisterBidderCommand(
            email,
            password,
            phoneNumber,
            nationalId,
            firstName,
            secondName,
            thirdName,
            lastName,
            address,
            imageBytes);

        var result = await sender.Send(command, ct);

        return result.Match(
            onValue: bidderDto => Results.Ok(bidderDto),
            onError: errors => errors.ToProblem());
    }
}