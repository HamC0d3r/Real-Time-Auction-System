using System.Diagnostics;
using System.Reflection;
using Bogus;
using MazadZone.Application.Features.Admin.DTOs;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Auctions.Enums;
using MazadZone.Domain.Auctions.ValueObjects;
using MazadZone.Domain.Categories;
using MazadZone.Domain.Shared.ValueObjects;
using MazadZone.Domain.Users.ValueObjects;
using MazadZone.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace MazadZone.Infrastructure.Persistence.Seeding;

public class SeedService : ISeedService
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<SeedService> _logger;
    private readonly IAuctionJobScheduler _auctionJobScheduler;

    public SeedService(
        AppDbContext dbContext,
        ILogger<SeedService> logger,
        IAuctionJobScheduler auctionJobScheduler)
    {
        _dbContext = dbContext;
        _logger = logger;
        _auctionJobScheduler = auctionJobScheduler;
    }

    private static string TruncateString(string? value, int maxLength)
    {
        if (string.IsNullOrWhiteSpace(value)) return "N/A";
        return value.Length > maxLength ? value.Substring(0, maxLength).Trim() : value.Trim();
    }

    private static void ClearDomainEvents(object entity)
    {
        try
        {
            if (entity is null) return;
            var method = entity.GetType().GetMethod(
                "ClearDomainEvents",
                BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.FlattenHierarchy);
            method?.Invoke(entity, null);
        }
        catch { /* ignore */ }
    }

    // High quality curated Unsplash images mapped per category
    private static readonly Dictionary<string, (string[] Titles, string[] Descriptions, string[] Images)> CategoryCatalogue = new(StringComparer.OrdinalIgnoreCase)
    {
        ["Tech and Electronics"] = (
            new[] {
                "Apple MacBook Pro 16\" M3 Max 36GB RAM",
                "Samsung Galaxy S24 Ultra 512GB Titanium",
                "Sony WH-1000XM5 Wireless Noise Canceling Headphones",
                "Canon EOS R6 Mark II Mirrorless Camera",
                "Apple Watch Ultra 2 GPS + Cellular 49mm",
                "ASUS ROG Strix G16 Gaming Laptop RTX 4080"
            },
            new[] {
                "Brand new in factory sealed packaging with full warranty.",
                "Mint condition, lightly tested in developer lab environment.",
                "Includes original accessories, charger, and official warranty card."
            },
            new[] {
                "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=1000&q=80"
            }
        ),
        ["Fashion and Style"] = (
            new[] {
                "Rolex Submariner Date 41mm Stainless Steel",
                "Nike Air Jordan 1 Retro High OG Chicago Edition",
                "Gucci GG Marmont Matelassé Shoulder Bag",
                "Tom Ford Designer Square Sunglasses Black"
            },
            new[] {
                "Authentic luxury product with certificate of authenticity.",
                "Unworn in original luxury box with tags attached."
            },
            new[] {
                "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=1000&q=80"
            }
        ),
        ["Home and Living"] = (
            new[] {
                "Italian Leather Mid-Century Accent Armchair",
                "Handwoven Wool Scandinavian Living Room Rug",
                "Minimalist Brass LED Arc Floor Lamp"
            },
            new[] {
                "High-grade materials with modern luxury design.",
                "Delivered in protective wooden crate."
            },
            new[] {
                "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1000&q=80"
            }
        ),
        ["Collectibles and Art"] = (
            new[] {
                "Original Abstract Oil Canvas Painting by European Artist",
                "Antique 19th Century French Bronze Mantel Clock",
                "Contemporary Hand-Carved Marble Sculpture"
            },
            new[] {
                "Verified collector piece with historical documentation.",
                "Preserved in museum-grade climate control."
            },
            new[] {
                "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1000&q=80"
            }
        ),
        ["Hobbies and Leisure"] = (
            new[] {
                "Gibson Les Paul Standard Custom Electric Guitar",
                "Vintage Handcrafted Dutch City Bicycle",
                "Sony FE 70-200mm f/2.8 GM OSS II Telephoto Lens"
            },
            new[] {
                "Professional grade gear in pristine condition.",
                "Includes hard shell case and premium accessories."
            },
            new[] {
                "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1485965120184-e220f721d03e?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?auto=format&fit=crop&w=1000&q=80"
            }
        ),
        ["Motors"] = (
            new[] {
                "2023 Porsche 911 Carrera S Coupe Agate Grey",
                "Custom BMW R NineT Cafe Racer Motorcycle",
                "1967 Ford Mustang Fastback V8 Restomod"
            },
            new[] {
                "Full service records, accident-free, low mileage.",
                "Registered, insured, ready for immediate transfer."
            },
            new[] {
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1000&q=80",
                "https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1000&q=80"
            }
        )
    };

    public async Task<SeedOperationResultDto> GenerateSeedsAsync(SeedGenerateRequestDto request, CancellationToken ct = default)
    {
        var stopwatch = Stopwatch.StartNew();
        int count = Math.Clamp(request.Count, 1, 50);

        _logger.LogInformation("Generating {Count} dynamic sysdate auctions in SQL Database...", count);

        if (request.PurgeAllFirst)
        {
            await PurgeSeedsAsync(purgeAllAuctions: true, ct);
        }

        // Fetch subcategories, sellers, and bidders
        var subCats = await _dbContext.Categories.Where(c => c.ParentCategoryId != null).ToListAsync(ct);
        if (!subCats.Any())
        {
            subCats = await _dbContext.Categories.ToListAsync(ct);
        }

        var sellers = await _dbContext.Sellers.Take(15).ToListAsync(ct);
        var bidders = await _dbContext.Bidders.Take(30).ToListAsync(ct);

        if (!subCats.Any() || !sellers.Any())
        {
            return new SeedOperationResultDto(
                Success: false,
                Action: "generate",
                GeneratedCount: 0,
                PurgedCount: 0,
                ExecutionDurationMs: stopwatch.ElapsedMilliseconds,
                Message: "Cannot seed: Base Categories or Sellers missing in database.",
                Timestamp: DateTime.UtcNow.ToString("O")
            );
        }

        var f = new Faker("en");
        var now = DateTime.UtcNow; // System Date
        var newAuctions = new List<Auction>();
        var shippingAddr = Address.Create("Amman", "King Abdullah II St", "15", "Near 4th Circle").Value;

        int activeRatio = request.StatusRatio?.Active ?? 60;
        int upcomingRatio = request.StatusRatio?.Upcoming ?? 20;

        var defaultCategoryPack = CategoryCatalogue["Tech and Electronics"];

        for (int i = 0; i < count; i++)
        {
            var category = subCats[i % subCats.Count];
            var seller = sellers[i % sellers.Count];

            // Resolve images and titles based on category name
            var pack = CategoryCatalogue.TryGetValue(category.Name.Value, out var foundPack) ? foundPack : defaultCategoryPack;
            string rawTitle = pack.Titles[i % pack.Titles.Length];
            string rawDesc = pack.Descriptions[i % pack.Descriptions.Length];
            string imageUrl = pack.Images[i % pack.Images.Length];

            // Determine target status
            AuctionStatus targetStatus;
            int percentageIndex = (i * 100) / count;
            if (percentageIndex < activeRatio)
                targetStatus = AuctionStatus.Active;
            else if (percentageIndex < activeRatio + upcomingRatio)
                targetStatus = AuctionStatus.Pending; // Upcoming
            else
                targetStatus = AuctionStatus.Ended;

            DateTime start;
            DateTime end;

            // Generate timestamps CLOSE TO SYSDATE for working timer testing
            if (targetStatus == AuctionStatus.Active)
            {
                // Started 10 to 30 minutes ago
                start = now.AddMinutes(-f.Random.Int(10, 30));
                
                // Ends in 15 to 120 minutes from now (live countdown timer!)
                int minutesRemaining = (i % 3 == 0) ? f.Random.Int(10, 25) : f.Random.Int(30, 180);
                end = now.AddMinutes(minutesRemaining);
            }
            else if (targetStatus == AuctionStatus.Pending)
            {
                // Starts in 10 to 60 minutes from now
                start = now.AddMinutes(f.Random.Int(10, 60));
                end = start.AddHours(24);
            }
            else
            {
                // Ended 15 to 120 minutes ago
                end = now.AddMinutes(-f.Random.Int(15, 120));
                start = end.AddHours(-2);
            }

            decimal startPrice = Math.Round(f.Random.Decimal(40, 1500), 2);
            decimal minIncrement = Math.Max(5m, Math.Round(startPrice * 0.05m, 2));

            string title = TruncateString($"{rawTitle} [MOCK]", 45);
            string description = TruncateString($"{rawDesc} Generated live sysdate auction entry.", 500);

            var images = new List<Image>
            {
                Image.Create(imageUrl, "Product main view", true).Value
            };

            var auctionResult = Auction.Create(
                sellerId: seller.Id,
                status: ItemStatus.LikeNew,
                condition: Description.Create("Brand new in factory sealed packaging.").Value,
                shippingAddress: shippingAddr,
                startBidAmount: startPrice,
                minBidAmount: minIncrement,
                startTime: start,
                endTime: end,
                title: title,
                description: description,
                images: images,
                categoryId: category.Id
            );

            if (auctionResult.IsSuccess)
            {
                var auction = auctionResult.Value;

                if (targetStatus == AuctionStatus.Active)
                {
                    auction.MarkAsActive(start.AddSeconds(10));

                    if (request.IncludeBids && bidders.Any())
                    {
                        int bidCount = f.Random.Int(2, 6);
                        decimal currentBid = startPrice;
                        for (int b = 0; b < bidCount; b++)
                        {
                            var bidder = bidders[(i + b) % bidders.Count];
                            if (bidder.Id == seller.Id)
                                bidder = bidders[(i + b + 1) % bidders.Count];

                            currentBid += minIncrement + f.Random.Decimal(5, 25);
                            var bidTime = start.AddMinutes(2 + b * 5);
                            if (bidTime >= now) bidTime = now.AddSeconds(-30);

                            auction.PlaceBid(bidder.Id, Math.Round(currentBid, 2), $"auth_sys_{Guid.NewGuid():N}", bidTime);
                        }
                    }
                }
                else if (targetStatus == AuctionStatus.Ended)
                {
                    auction.MarkAsActive(start.AddSeconds(10));
                    if (bidders.Any())
                    {
                        var bidder = bidders[i % bidders.Count];
                        auction.PlaceBid(bidder.Id, startPrice + 45, $"auth_sys_{Guid.NewGuid():N}", start.AddMinutes(20));
                    }
                    auction.MarkAsEnded(end.AddSeconds(10));
                }

                ClearDomainEvents(auction);
                newAuctions.Add(auction);
            }
        }

        await _dbContext.Auctions.AddRangeAsync(newAuctions, ct);
        await _dbContext.SaveChangesAsync(ct);

        // Schedule Hangfire background jobs asynchronously so HTTP request returns quickly
        _ = Task.Run(() =>
        {
            try
            {
                foreach (var auction in newAuctions)
                {
                    if (auction.Status == AuctionStatus.Pending && auction.StartTime > now)
                    {
                        _auctionJobScheduler.ScheduleAuctionStarting(auction.Id.Value, auction.StartTime);
                    }

                    if ((auction.Status == AuctionStatus.Active || auction.Status == AuctionStatus.Pending) && auction.EndTime > now)
                    {
                        _auctionJobScheduler.ScheduleAuctionClosing(auction.Id.Value, auction.EndTime);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Background Hangfire job scheduling encountered an issue");
            }
        });

        stopwatch.Stop();

        return new SeedOperationResultDto(
            Success: true,
            Action: "generate",
            GeneratedCount: newAuctions.Count,
            PurgedCount: 0,
            ExecutionDurationMs: stopwatch.ElapsedMilliseconds,
            Message: $"Successfully generated {newAuctions.Count} sysdate auctions in {stopwatch.ElapsedMilliseconds}ms.",
            Timestamp: DateTime.UtcNow.ToString("O")
        );
    }

    public async Task<SeedOperationResultDto> PurgeSeedsAsync(bool purgeAllAuctions = true, CancellationToken ct = default)
    {
        var stopwatch = Stopwatch.StartNew();

        _logger.LogInformation("Purging auctions from SQL database (purgeAllAuctions={PurgeAll})...", purgeAllAuctions);

        int initialCount = await _dbContext.Auctions.CountAsync(ct);

        if (purgeAllAuctions)
        {
            _dbContext.Transactions.RemoveRange(_dbContext.Transactions);
            _dbContext.Payments.RemoveRange(_dbContext.Payments);
            _dbContext.Feedbacks.RemoveRange(_dbContext.Feedbacks);
            _dbContext.Disputes.RemoveRange(_dbContext.Disputes);
            _dbContext.Orders.RemoveRange(_dbContext.Orders);
            _dbContext.Bids.RemoveRange(_dbContext.Bids);
            _dbContext.Items.RemoveRange(_dbContext.Items);
            _dbContext.Auctions.RemoveRange(_dbContext.Auctions);
        }
        else
        {
            var mockAuctions = await _dbContext.Auctions
                .Include(a => a.Item)
                .Include(a => a.Bids)
                .Where(a => a.Item.Title.Contains("[MOCK]"))
                .ToListAsync(ct);

            _dbContext.Auctions.RemoveRange(mockAuctions);
        }

        await _dbContext.SaveChangesAsync(ct);
        int finalCount = await _dbContext.Auctions.CountAsync(ct);
        int purgedCount = initialCount - finalCount;

        stopwatch.Stop();

        string msg = purgeAllAuctions
            ? $"Purged ALL {purgedCount} auctions & associated bids/orders from database. Admin accounts & categories preserved."
            : $"Purged {purgedCount} mock seed auctions from database. Core data preserved.";

        return new SeedOperationResultDto(
            Success: true,
            Action: "purge",
            GeneratedCount: 0,
            PurgedCount: purgedCount,
            ExecutionDurationMs: stopwatch.ElapsedMilliseconds,
            Message: msg,
            Timestamp: DateTime.UtcNow.ToString("O")
        );
    }

    public async Task<SeedOperationResultDto> ResetSeedsAsync(SeedGenerateRequestDto request, CancellationToken ct = default)
    {
        var purgeResult = await PurgeSeedsAsync(purgeAllAuctions: true, ct);
        var generateResult = await GenerateSeedsAsync(request, ct);

        return new SeedOperationResultDto(
            Success: generateResult.Success,
            Action: "reset",
            GeneratedCount: generateResult.GeneratedCount,
            PurgedCount: purgeResult.PurgedCount,
            ExecutionDurationMs: purgeResult.ExecutionDurationMs + generateResult.ExecutionDurationMs,
            Message: $"Atomic Reset: Purged {purgeResult.PurgedCount} old auctions & generated {generateResult.GeneratedCount} fresh sysdate auctions.",
            Timestamp: DateTime.UtcNow.ToString("O")
        );
    }

    public async Task<SeedStatsDto> GetStatsAsync(CancellationToken ct = default)
    {
        var now = DateTime.UtcNow;
        var threeHoursFromNow = now.AddHours(3);

        var auctions = await _dbContext.Auctions
            .Include(a => a.Item)
            .Include(a => a.Bids)
            .AsNoTracking()
            .ToListAsync(ct);

        int total = auctions.Count;
        int active = auctions.Count(a => (a.Status == AuctionStatus.Active || (a.StartTime <= now && a.EndTime > now)) && a.EndTime > now);
        int expiringSoon = auctions.Count(a => (a.Status == AuctionStatus.Active || (a.StartTime <= now && a.EndTime > now)) && a.EndTime <= threeHoursFromNow && a.EndTime > now);
        int upcoming = auctions.Count(a => a.Status == AuctionStatus.Pending && a.StartTime > now);
        int ended = auctions.Count(a => a.Status == AuctionStatus.Ended || a.Status == AuctionStatus.Cancelled || a.EndTime <= now);
        int totalBids = auctions.Sum(a => a.Bids.Count);

        return new SeedStatsDto(
            TotalMockAuctions: total,
            ActiveCount: active,
            ExpiringSoonCount: expiringSoon,
            UpcomingCount: upcoming,
            EndedCount: ended,
            TotalMockBids: totalBids,
            LastSeededAt: total > 0 ? DateTime.UtcNow.ToString("O") : null
        );
    }
}
