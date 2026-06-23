using Google.GenAI;
using Google.GenAI.Types;
using MazadZone.Application.Services;
using MazadZone.Infrastructure.Configuration;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace MazadZone.Infrastructure.Services;

/// <summary>
/// Implements the AI chat agent service using Google Gemini API.
/// This is the only class in the solution that directly references the Gemini SDK,
/// keeping the Domain and Application layers free of external AI dependencies.
/// </summary>
public sealed class GeminiChatAgentService : IChatAgentService
{
    private readonly GeminiOptions _options;
    private readonly ILogger<GeminiChatAgentService> _logger;
    private readonly Client? _client;
    private static readonly string[] InvalidApiKeyPlaceholders = new[]
    {
        "API_KEY",
        "null",
        "none"
    };

    /// <summary>
    /// The system instruction that constrains the LLM to only answer about MazadZone auctions.
    /// Active auction data is dynamically appended to this instruction at runtime.
    /// </summary>
    private const string SystemPrompt =
        """
        You are an official virtual sales assistant for the MazadZone auction platform. Your ONLY purpose is to help users find information about currently active auctions based strictly on the JSON data provided in the context.
        Rules:
        1. You must base your answers ONLY on the provided active auctions data.
        2. If the user asks about ANY topic outside of MazadZone, auctions, or bidding, you must politely refuse and state: '[-] Sorry, I can only help you with the auctions available on the platform.' (Sorry, I can only assist you with available auctions on the platform).
        3. Do not invent, guess, or assume any auction data. If an auction isn't in the context, say it is currently unavailable.
        4. Use [+] to expression on possetive response (success) and [-] to negative (falure) and [?] to ask bidder questions 
        5. When recommending or listing auctions, write ONLY the auction titles in bold (e.g., **MacBook Air M2 13-inch**). Do NOT include other details like Category, Starting Price, Current Bid, End Time, or Time Left in the message text. The frontend will display these details automatically.
        """;

    private const string FallbackMessage = "The sales agent is currently busy. Please try again later.";

    public GeminiChatAgentService(
        IOptions<GeminiOptions> options,
        ILogger<GeminiChatAgentService> logger)
    {
        _options = options.Value;
        _logger = logger;

        var apiKey = _options.ApiKey?.Trim();
        if (string.IsNullOrWhiteSpace(apiKey) || InvalidApiKeyPlaceholders.Contains(apiKey, StringComparer.OrdinalIgnoreCase))
        {
            // TODO(security): In production, use a managed secret store (e.g., Azure Key Vault, GCP Secret Manager).
            _logger.LogWarning(
                "Gemini API key is not configured or is set to an invalid placeholder value. " +
                "Set it via 'Gemini:ApiKey' in appsettings.json, environment variable 'Gemini__ApiKey', or .NET User Secrets.");
            _client = null;
        }
        else
        {
            _client = new Client(apiKey: apiKey);
        }
    }

    public async Task<string> GenerateSalesResponseAsync(
        string userMessage,
        string activeAuctionsJsonContext,
        CancellationToken cancellationToken)
    {
        if (_client is null)
        {
            _logger.LogWarning("Gemini API key is not configured. Returning fallback message.");
            return FallbackMessage;
        }

        try
        {
            // Build the system instruction with the active auctions context injected.
            // The context is placed in the system instruction (not the user message)
            // to prevent prompt injection via the user's message.
            var fullSystemInstruction = $"""
                {SystemPrompt}

                === ACTIVE AUCTIONS DATA (JSON) ===
                {activeAuctionsJsonContext}
                === END OF ACTIVE AUCTIONS DATA ===
                """;

            var config = new GenerateContentConfig
            {
                SystemInstruction = new Content
                {
                    Parts = new List<Part>
                    {
                        new Part { Text = fullSystemInstruction }
                    }
                },
                Temperature = _options.Temperature,
            };

            var response = await _client.Models.GenerateContentAsync(
                model: _options.Model,
                contents: userMessage,
                config: config,
                cancellationToken: cancellationToken);

            var responseText = response?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text;

            if (string.IsNullOrWhiteSpace(responseText))
            {
                _logger.LogWarning("Gemini returned an empty response for user message");
                return FallbackMessage;
            }

            return responseText;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Gemini API call failed while processing chat message");
            return FallbackMessage;
        }
    }
}
