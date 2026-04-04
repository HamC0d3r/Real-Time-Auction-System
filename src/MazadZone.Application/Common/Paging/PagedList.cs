namespace MazadZone.Application.Common.Paging;

public class PagedList<T>
{
    public PagedList(List<T>? items, int pageNumber, int pageSize, int totalCount)
    {
        Items = items;
        PageNumber = pageNumber;
        PageSize = pageSize;
        TotalCount = totalCount;
        TotalPages = (int)Math.Ceiling((double)totalCount / pageSize);
        
    }
    public int PageNumber { get; init; }
    public int PageSize { get; init; }
    public int TotalPages { get; init; }
    public int TotalCount { get; init; }

    public IReadOnlyCollection<T>? Items { get; init; }

    public static PagedList<T> Empty()
            => new PagedList<T>(new List<T>(), 0, 0, 0);


}