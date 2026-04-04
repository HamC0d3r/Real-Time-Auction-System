using MazadZone.Domain.Primitives.Results;

namespace MazadZone.Domain.Primitives;

public interface ISoftDeletable
{
    // Properties to track state
    bool IsDeleted { get; }
    DateTime? DeletedOnUtc { get; }

    // The two methods you requested
    Result Delete();
    Result Restore();
}