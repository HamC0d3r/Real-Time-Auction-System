namespace MazadZone.Application.Common.Paging;

public class PagedList<T>
{
    public PagedList(IReadOnlyList<T> items, int pageNumber, int pageSize, int totalCount)
    {
        // Enforce non-null collection. If null is passed, assign an empty array.
        Items = items ?? Array.Empty<T>();
        
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalCount = totalCount;
        
        // Prevent DivideByZeroException if PageSize is ever accidentally 0
        TotalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0;
    }

    public int PageNumber { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
    public int TotalCount { get; init; }
    public IReadOnlyList<T> Items { get; init; }

    // --- New Navigation Helpers ---
    public bool HasPreviousPage => PageNumber > 1;
    public bool HasNextPage => PageNumber < TotalPages;

    // --- Enhanced Empty Factory ---
    public static PagedList<T> Empty(int pageNumber = 1, int pageSize = 10)
        => new PagedList<T>(Array.Empty<T>(), pageNumber, pageSize, 0);
}