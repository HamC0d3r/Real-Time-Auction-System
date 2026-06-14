using Google.Cloud.Vision.V1;
using MazadZone.Application.Services;
using System.Text.RegularExpressions;
using Microsoft.Extensions.DependencyInjection;

namespace MazadZone.Infrastructure.Services;

public class GoogleVisionIdentityExtractionService : IIdentityExtractionService
{
    private readonly IServiceProvider _serviceProvider;
    
    // Target 10 to 15 digit national identifier sequence.
    // Specifying a 250ms matching timeout to prevent resource-exhaustion/ReDoS attacks.
    private static readonly Regex NationalIdRegex = new Regex(
        @"\d{10,15}", 
        RegexOptions.Compiled, 
        TimeSpan.FromMilliseconds(250));

    private static readonly Regex EngNameRegex = new Regex(
        @"Name:\s*([A-Za-z\s\-\']+)", 
        RegexOptions.Compiled | RegexOptions.IgnoreCase, 
        TimeSpan.FromMilliseconds(250));

    private static readonly Regex ArNameRegex = new Regex(
        @"(?:الاسم|الاسـم|الاسم الكامل)[:\s]*(.+)", 
        RegexOptions.Compiled, 
        TimeSpan.FromMilliseconds(250));

    private static readonly Regex FallbackArNameRegex = new Regex(
        @"([\u0600-\u06FF]{2,}\s+[\u0600-\u06FF]{2,}\s+[\u0600-\u06FF]{2,}(?:\s+[\u0600-\u06FF]{2,})?)", 
        RegexOptions.Compiled, 
        TimeSpan.FromMilliseconds(250));

    private static readonly Regex DobRegex = new Regex(
        @"(\d{2}[\/\-]\d{2}[\/\-]\d{4})", 
        RegexOptions.Compiled, 
        TimeSpan.FromMilliseconds(250));

    private static readonly Regex GenderRegex = new Regex(
        @"([MF])(?:[\/\\]|$)", 
        RegexOptions.Compiled, 
        TimeSpan.FromMilliseconds(250));

    public GoogleVisionIdentityExtractionService(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public async Task<ExtractedIdData> ExtractDataAsync(byte[] imageBytes)
    {
        try
        {
            // Resolve the client inside the try-catch block to handle missing credentials gracefully
            ImageAnnotatorClient client;
            try
            {
                client = _serviceProvider.GetRequiredService<ImageAnnotatorClient>();
            }
            catch (Exception ex)
            {
                return new ExtractedIdData(null, false, "Google Cloud Vision API credentials are not configured on this server: " + (ex.InnerException?.Message ?? ex.Message));
            }

            var image = Image.FromBytes(imageBytes);
            
            // Invoke DetectDocumentTextAsync for dense document text/layout optimization mode
            var response = await client.DetectDocumentTextAsync(image);
            
            var rawText = response?.Text;
            if (string.IsNullOrWhiteSpace(rawText))
            {
                return new ExtractedIdData(null, false, "No text was detected on the ID card. Please ensure the image is clear and try again.");
            }

            // Remove hidden Unicode direction markers
            var cleanRawText = rawText.Replace("\u200E", "").Replace("\u200F", "");

            // Strip whitespaces, newlines, and hyphens to build a contiguous raw string for National ID matching
            var cleanTextForId = cleanRawText
                .Replace(" ", "")
                .Replace("-", "")
                .Replace("\r", "")
                .Replace("\n", "");

            var idMatch = NationalIdRegex.Match(cleanTextForId);
            if (!idMatch.Success)
            {
                return new ExtractedIdData(null, false, "Could not locate a valid National ID sequence in the document text.");
            }

            var nationalId = idMatch.Value;

            // Extract English name
            string? englishFullName = null;
            var engNameMatch = EngNameRegex.Match(cleanRawText);
            if (engNameMatch.Success)
            {
                englishFullName = engNameMatch.Groups[1].Value.Trim();
            }

            // Extract Arabic name
            string? arabicFullName = null;
            var arNameMatch = ArNameRegex.Match(cleanRawText);
            if (arNameMatch.Success)
            {
                arabicFullName = arNameMatch.Groups[1].Value.Trim();
            }
            else
            {
                // Fallback: Find 3 to 4 consecutive Arabic words (likely the full name)
                // But ignore lines containing common ID card headers
                var restrictedWords = new[] { "بطاقة", "شخصية", "دائرة", "أحوال", "الأحوال", "المدنية", "الجوازات", "المملكة", "الاردنية", "الأردنية", "الهاشمية", "وزارة", "الداخلية", "رقم", "وطني" };
                var lines = cleanRawText.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var line in lines)
                {
                    if (restrictedWords.Any(w => line.Contains(w)))
                        continue;

                    var fallbackMatch = FallbackArNameRegex.Match(line);
                    if (fallbackMatch.Success)
                    {
                        arabicFullName = fallbackMatch.Groups[1].Value.Trim();
                        break;
                    }
                }
            }

            // Extract Date of Birth
            string? dateOfBirth = null;
            var dobMatch = DobRegex.Match(cleanRawText);
            if (dobMatch.Success)
            {
                dateOfBirth = dobMatch.Groups[1].Value;
            }

            // Extract Gender
            string? gender = null;
            var genderMatch = GenderRegex.Match(cleanRawText);
            if (genderMatch.Success)
            {
                gender = genderMatch.Groups[1].Value;
            }

            return new ExtractedIdData(
                NationalId: nationalId,
                Success: true,
                ErrorMessage: null,
                EnglishFullName: englishFullName,
                ArabicFullName: arabicFullName,
                DateOfBirth: dateOfBirth,
                Gender: gender);
        }
        catch (Grpc.Core.RpcException ex)
        {
            // Intercept specific SDK faults or network drops, presenting a clean validation error message
            return new ExtractedIdData(null, false, $"Network or API connection error with identity recognition service: {ex.Status.Detail}");
        }
        catch (Exception ex)
        {
            return new ExtractedIdData(null, false, $"An unexpected error occurred during OCR text extraction: {ex.Message}");
        }
    }
}
