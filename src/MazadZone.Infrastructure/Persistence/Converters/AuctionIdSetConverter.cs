using System.Text.Json;
using MazadZone.Domain.Auctions;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace MazadZone.Infrastructure.Persistence.Converters;

public class AuctionIdSetConverter : ValueConverter<HashSet<AuctionId>, string>
{
    public AuctionIdSetConverter() : base(
        auctions => JsonSerializer.Serialize(auctions.Select(a => a.Value), JsonSerializerOptions.Default),
        
        json => string.IsNullOrWhiteSpace(json) 
            ? new HashSet<AuctionId>() 
            : JsonSerializer.Deserialize<List<Guid>>(json, JsonSerializerOptions.Default)!
                .Select(guid => AuctionId.From(guid))
                .ToHashSet()
    ) { }
}