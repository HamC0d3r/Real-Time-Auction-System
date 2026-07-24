namespace MazadZone.Application.Features.Admin.DTOs;

public record SeedGenerateRequestDto(
    int Count = 10,
    string? Preset = null,
    List<string>? Categories = null,
    SeedStatusRatioDto? StatusRatio = null,
    SeedTimeOffsetsDto? TimeOffsets = null,
    bool IncludeBids = true,
    bool PurgeAllFirst = false
);

public record SeedPurgeRequestDto(
    bool PurgeAllAuctions = true
);

public record SeedStatusRatioDto(
    int Active = 50,
    int Upcoming = 25,
    int Ended = 25
);

public record SeedTimeOffsetsDto(
    int? ActiveEndInMinutes = 60, // Default 60 minutes for close sysdate testing
    int? UpcomingStartInMinutes = 15
);

public record SeedOperationResultDto(
    bool Success,
    string Action,
    int GeneratedCount,
    int PurgedCount,
    long ExecutionDurationMs,
    string Message,
    string Timestamp
);

public record SeedStatsDto(
    int TotalMockAuctions,
    int ActiveCount,
    int ExpiringSoonCount,
    int UpcomingCount,
    int EndedCount,
    int TotalMockBids,
    string? LastSeededAt
);
