namespace MazadZone.Application.Features.Orders.Queries.DTOs;

public record FeedbackDto(Guid Id, string AuthorName, int Rating, string Comment, string Reply, DateTime CreatedAt, Guid? AuctionId = null, string? AuctionTitle = null, string? AuctionImageUrl = null, Guid? AuthorId = null);