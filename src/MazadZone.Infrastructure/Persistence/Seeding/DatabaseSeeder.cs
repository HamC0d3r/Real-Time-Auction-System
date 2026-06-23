using Bogus;
using MazadZone.Application.Services;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Auctions.Enums;
using MazadZone.Domain.Bidders;
using MazadZone.Domain.Categories;
using MazadZone.Domain.Disputes;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Payments.Enums;
using MazadZone.Domain.Sellers;
using MazadZone.Domain.Shared.ValueObjects;
using MazadZone.Domain.Users;
using MazadZone.Domain.Users.ValueObjects;
using MazadZone.Domain.ValueObjects;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using MzadZone.Domain.Payments;
using MzadZone.Domain.Payments.Entities;
using System.Reflection;

namespace MazadZone.Infrastructure.Persistence.Seeding;

/// <summary>
/// Seeds the MazadZone database with realistic mock data:
/// - 1 admin account + 10 seller accounts + 30 bidder accounts (all loginable with password "MazadZone123!")
/// - 5 dispute types
/// - 5 root categories with 15 subcategories
/// - 200 auctions spread across all lifecycle states with testable time windows
/// - Real bids on every active auction
/// - Orders, payments, feedbacks, and disputes covering all lifecycle states
/// </summary>
public class DatabaseSeeder : IDatabaseSeeder
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<DatabaseSeeder> _logger;
    private readonly IPasswordService _passwordService;
    private readonly IAuctionJobScheduler _auctionJobScheduler;

    // ─── Shared password for ALL seeded users (sellers + bidders) ──────────────
    private const string PlainTextPassword = "MazadZone123!";

    public DatabaseSeeder(
        AppDbContext dbContext,
        ILogger<DatabaseSeeder> logger,
        IPasswordService passwordService,
        IAuctionJobScheduler auctionJobScheduler)
    {
        _dbContext = dbContext;
        _logger = logger;
        _passwordService = passwordService;
        _auctionJobScheduler = auctionJobScheduler;
    }

    // ── Reflection helpers ─────────────────────────────────────────────────────

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

    private static void SetPrivateProperty(object entity, string propertyName, object value)
    {
        var prop = entity.GetType().GetProperty(
            propertyName,
            BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance);
        prop?.SetValue(entity, value);
    }

    // ── Entry point ────────────────────────────────────────────────────────────

    public async Task SeedAsync()
    {
        if (await _dbContext.Users.AnyAsync())
        {
            _logger.LogInformation("Database already seeded. Skipping...");
            return;
        }

        _logger.LogInformation("Starting full MazadZone database seeding...");

        Randomizer.Seed = new Random(2026);
        var f = new Faker("en");

        // Hash the shared password once — BCrypt is expensive
        var hashedPassword = _passwordService.HashPassword(PlainTextPassword);

        var now = DateTime.UtcNow;

        // ── 1. Dispute Types ────────────────────────────────────────────────────
        var disputeTypes = SeedDisputeTypes();
        await _dbContext.AddRangeAsync(disputeTypes);
        await _dbContext.SaveChangesAsync();

        // ── 2. Categories ───────────────────────────────────────────────────────
        var (rootCats, subCats) = SeedCategories();
        await _dbContext.AddRangeAsync(rootCats);
        await _dbContext.SaveChangesAsync();
        await _dbContext.AddRangeAsync(subCats);
        await _dbContext.SaveChangesAsync();

        // ── 3. Users: 1 admin + 10 sellers + 30 bidders ──────────────────────
        var (adminUsers, sellerUsers, sellerEntities, bidderUsers, bidderEntities) =
            SeedUsers(hashedPassword, f);

        await _dbContext.AddRangeAsync(adminUsers);
        await _dbContext.AddRangeAsync(sellerUsers);
        await _dbContext.AddRangeAsync(bidderUsers);
        await _dbContext.SaveChangesAsync();

        await _dbContext.AddRangeAsync(sellerEntities);
        await _dbContext.AddRangeAsync(bidderEntities);
        await _dbContext.SaveChangesAsync();

        // ── 4. Auctions (200 total) ─────────────────────────────────────────────
        var (allAuctions, orderItems) = BuildAuctions(
            now, f, sellerEntities, bidderEntities, subCats);

        foreach (var a in allAuctions) ClearDomainEvents(a);
        await _dbContext.AddRangeAsync(allAuctions);
        await _dbContext.SaveChangesAsync();

        // ── 5. Orders, Payments, Feedbacks, Disputes ───────────────────────────
        await SeedOrdersAndPayments(orderItems, bidderEntities, disputeTypes);

        _logger.LogInformation("Scheduling Hangfire jobs for seeded pending and active auctions...");
        foreach (var auction in allAuctions)
        {
            if (auction.Status == AuctionStatus.Pending)
            {
                _auctionJobScheduler.ScheduleAuctionStarting(auction.Id.Value, auction.StartTime);
                _auctionJobScheduler.ScheduleAuctionClosing(auction.Id.Value, auction.EndTime);
            }
            else if (auction.Status == AuctionStatus.Active)
            {
                _auctionJobScheduler.ScheduleAuctionClosing(auction.Id.Value, auction.EndTime);
            }
        }

        _logger.LogInformation(
            "🎉 MazadZone seeding complete — {AuctionCount} auctions, {AdminCount} admins, {SellerCount} sellers, {BidderCount} bidders.",
            allAuctions.Count, adminUsers.Count, sellerEntities.Count, bidderEntities.Count);
    }

    // ── Dispute Types ──────────────────────────────────────────────────────────

    private static List<DisputeType> SeedDisputeTypes()
    {
        var types = new List<DisputeType>
        {
            DisputeType.Create("Item Not Received",
                "Buyer claims they did not receive the purchased item.").Value,
            DisputeType.Create("Item Not As Described",
                "Buyer claims the item condition differs from the listing description.").Value,
            DisputeType.Create("Damaged Item",
                "Buyer claims the item arrived damaged due to shipping or handling.").Value,
            DisputeType.Create("Counterfeit Product",
                "Buyer suspects the item is a counterfeit or replica.").Value,
            DisputeType.Create("Seller Unresponsive",
                "Seller has not communicated or shipped within agreed timeframe.").Value,
        };
        foreach (var dt in types) ClearDomainEvents(dt);
        return types;
    }

    // ── Categories ─────────────────────────────────────────────────────────────

    private static (List<Category> roots, List<Category> subs) SeedCategories()
    {
        // 6 main platform categories
        var roots = new List<Category>
        {
            Category.Create("Tech and Electronics",  "Phones, laptops, gaming, TVs, cameras, and all gadgets.").Value,     // 0
            Category.Create("Fashion and Style",     "Clothing, watches, bags, shoes, and accessories.").Value,            // 1
            Category.Create("Home and Living",       "Furniture, appliances, decor, and garden.").Value,                   // 2
            Category.Create("Collectibles and Art",  "Paintings, antiques, memorabilia, and rare finds.").Value,           // 3
            Category.Create("Hobbies and Leisure",   "Sports, cameras, musical instruments, and outdoor gear.").Value,     // 4
            Category.Create("Motors",                "Cars, motorcycles, trucks, boats, and spare parts.").Value,          // 5
        };
        foreach (var c in roots) ClearDomainEvents(c);

        var subs = new List<Category>
        {
            // ── Tech and Electronics (root[0]) — indices 0-5 ──────────────────
            Category.Create("Smartphones & Tablets",  "Mobile phones, tablets, and smart devices.",       roots[0].Id).Value, // 0
            Category.Create("Laptops & Computers",    "Notebooks, desktops, and accessories.",            roots[0].Id).Value, // 1
            Category.Create("Cameras & Photography",  "DSLR, mirrorless, action cams, and drones.",      roots[0].Id).Value, // 2
            Category.Create("Audio & Headphones",     "Speakers, headphones, earbuds, and HiFi gear.",   roots[0].Id).Value, // 3
            Category.Create("Gaming",                 "Consoles, games, controllers, and PC parts.",      roots[0].Id).Value, // 4
            Category.Create("Other Electronics",      "All other electronic items.",                       roots[0].Id).Value, // 5

            // ── Fashion and Style (root[1]) — indices 6-11 ───────────────────
            Category.Create("Watches & Jewellery",    "Luxury watches, rings, bracelets, and necklaces.", roots[1].Id).Value, // 6
            Category.Create("Bags & Accessories",     "Handbags, wallets, belts, and sunglasses.",        roots[1].Id).Value, // 7
            Category.Create("Clothing",               "Tops, bottoms, outerwear, and formal wear.",        roots[1].Id).Value, // 8
            Category.Create("Shoes & Sneakers",       "Trainers, heels, boots, and sandals.",             roots[1].Id).Value, // 9
            Category.Create("Sportswear",             "Athletic clothing, trainers, and gym gear.",        roots[1].Id).Value, // 10
            Category.Create("Other Fashion",          "All other fashion and style items.",                roots[1].Id).Value, // 11

            // ── Home and Living (root[2]) — indices 12-17 ────────────────────
            Category.Create("Furniture",              "Sofas, beds, tables, chairs, and wardrobes.",      roots[2].Id).Value, // 12
            Category.Create("Kitchen & Appliances",   "Cookers, fridges, washing machines, and mixers.",  roots[2].Id).Value, // 13
            Category.Create("Home Decor",             "Rugs, curtains, lamps, and wall art.",              roots[2].Id).Value, // 14
            Category.Create("Garden & Outdoor",       "Plants, patio furniture, and garden tools.",        roots[2].Id).Value, // 15
            Category.Create("Tools & DIY",            "Power tools, hand tools, and hardware.",            roots[2].Id).Value, // 16
            Category.Create("Other Home",             "All other home and living items.",                  roots[2].Id).Value, // 17

            // ── Collectibles and Art (root[3]) — indices 18-23 ───────────────
            Category.Create("Paintings & Fine Art",   "Original oil, watercolour, and mixed-media art.",  roots[3].Id).Value, // 18
            Category.Create("Antiques & Vintage",     "Pre-1970 items, retro objects, and curiosities.",  roots[3].Id).Value, // 19
            Category.Create("Sports Memorabilia",     "Signed jerseys, balls, and athlete collectibles.", roots[3].Id).Value, // 20
            Category.Create("Stamps & Coins",         "Rare stamps, banknotes, and numismatics.",          roots[3].Id).Value, // 21
            Category.Create("Trading Cards",          "Football, basketball, and TCG cards.",              roots[3].Id).Value, // 22
            Category.Create("Other Collectibles",     "All other collectible items.",                      roots[3].Id).Value, // 23

            // ── Hobbies and Leisure (root[4]) — indices 24-29 ────────────────
            Category.Create("Sports Equipment",       "Bicycles, gym gear, rackets, and team sports.",    roots[4].Id).Value, // 24
            Category.Create("Musical Instruments",    "Guitars, pianos, drums, and studio gear.",         roots[4].Id).Value, // 25
            Category.Create("Books & Magazines",      "Novels, textbooks, comics, and rare editions.",    roots[4].Id).Value, // 26
            Category.Create("Travel & Luggage",       "Suitcases, backpacks, and travel accessories.",    roots[4].Id).Value, // 27
            Category.Create("Toys & Games",           "Board games, action figures, and kids' toys.",     roots[4].Id).Value, // 28
            Category.Create("Other Hobbies",          "All other hobby and leisure items.",               roots[4].Id).Value, // 29

            // ── Motors (root[5]) — indices 30-35 ─────────────────────────────
            Category.Create("Cars",                   "Saloons, SUVs, sports cars, and classics.",        roots[5].Id).Value, // 30
            Category.Create("Motorcycles",            "Road, off-road, and scooters.",                    roots[5].Id).Value, // 31
            Category.Create("Trucks & Vans",          "Pick-ups, vans, and heavy vehicles.",              roots[5].Id).Value, // 32
            Category.Create("Boats & Watercraft",     "Speedboats, yachts, and jet skis.",                roots[5].Id).Value, // 33
            Category.Create("Spare Parts",            "OEM and aftermarket parts and accessories.",       roots[5].Id).Value, // 34
            Category.Create("Other Motors",           "All other motors and vehicles.",                   roots[5].Id).Value, // 35
        };
        foreach (var c in subs) ClearDomainEvents(c);

        return (roots, subs);
    }

    // ── Users ──────────────────────────────────────────────────────────────────

    private (
        List<User> adminUsers,
        List<User> sellerUsers,
        List<Seller> sellers,
        List<User> bidderUsers,
        List<Bidder> bidders)
        SeedUsers(string hashedPassword, Faker f)
    {
        // Jordanian cities for address realism
        var cities = new[]
        {
            "Amman", "Zarqa", "Irbid", "Aqaba", "Madaba",
            "Jerash", "Ajloun", "Karak", "Tafilah", "Mafraq"
        };

        // ── 1 Admin ────────────────────────────────────────────────────────────
        var adminUser = User.Create(
            email: "admin@mazadzone.com",
            passwordHash: hashedPassword,
            phoneNumber: "0799999000",
            firstName: "MazadZone",
            secondName: "Platform",
            thirdName: "System",
            lastName: "Admin",
            roles: UserRole.Admin
        ).Value;
        ClearDomainEvents(adminUser);

        var adminUsers = new List<User> { adminUser };

        // ── 10 Sellers ──────────────────────────────────────────────────────────
        var sellerProfiles = new[]
        {
            (fn:"Ahmad",    sn:"Riyad",   tn:"Khaled", ln:"Mansour",  phone:"0791234501", natId:"9801234501"),
            (fn:"Sara",     sn:"Nour",    tn:"Hassan", ln:"Al-Rashid",phone:"0791234502", natId:"9801234502"),
            (fn:"Omar",     sn:"Tariq",   tn:"Bilal",  ln:"Haddad",   phone:"0791234503", natId:"9801234503"),
            (fn:"Lina",     sn:"Dalia",   tn:"Yasmin", ln:"Barakat",  phone:"0791234504", natId:"9801234504"),
            (fn:"Khalid",   sn:"Faris",   tn:"Ziad",   ln:"Saleh",    phone:"0791234505", natId:"9801234505"),
            (fn:"Reem",     sn:"Hala",    tn:"Nadia",  ln:"Qasem",    phone:"0791234506", natId:"9801234506"),
            (fn:"Yousef",   sn:"Majed",   tn:"Samir",  ln:"Al-Shami", phone:"0791234507", natId:"9801234507"),
            (fn:"Dina",     sn:"Rana",    tn:"Sana",   ln:"Khalil",   phone:"0791234508", natId:"9801234508"),
            (fn:"Faisal",   sn:"Nasser",  tn:"Wael",   ln:"Abboud",   phone:"0791234509", natId:"9801234509"),
            (fn:"Maya",     sn:"Layla",   tn:"Hana",   ln:"Najjar",   phone:"0791234510", natId:"9801234510"),
        };

        var sellerUsers = new List<User>();
        var sellers = new List<Seller>();
        var bidders = new List<Bidder>();

        for (int i = 0; i < sellerProfiles.Length; i++)
        {
            var p = sellerProfiles[i];
            var city = cities[i % cities.Length];
            var user = User.Create(
                email: $"seller{i + 1}@mazadzone.com",
                passwordHash: hashedPassword,
                phoneNumber: p.phone.Replace("-", ""),
                firstName: p.fn,
                secondName: p.sn,
                thirdName: p.tn,
                lastName: p.ln,
                roles: UserRole.Bidder | UserRole.Seller
            ).Value;

            ClearDomainEvents(user);

            var address = Address.Create(
                city,
                $"{f.Address.StreetName()} St",
                f.Random.Int(1, 200).ToString(),
                $"Near {f.Company.CompanyName()}"
            ).Value;

            var seller = Seller.BecomeSeller(user.Id).Value;
            seller.Verify();
            ClearDomainEvents(seller);

            // Also give them a Bidder record so they can bid on others' auctions
            var bidder = Bidder.CompleteProfile(user.Id, p.natId, address).Value;
            bidder.Verify();
            ClearDomainEvents(bidder);

            sellerUsers.Add(user);
            sellers.Add(seller);
            bidders.Add(bidder);
        }

        // ── 30 Bidders ─────────────────────────────────────────────────────────
        var bidderUsers = new List<User>();

        var bidderFirstNames = new[]
        {
            "Ibrahim", "Fatima", "Hasan", "Maryam", "Ziad",
            "Ruba",    "Tariq",  "Aya",   "Walid",  "Suha",
            "Nizar",   "Ghada", "Bilal",  "Noor",   "Samer",
            "Rasha",   "Amjad", "Diana",  "Khaled", "Lara",
            "Mazen",   "Hiba",  "Adnan",  "Mais",   "Raed",
            "Sana",    "Wissam","Dalia",  "Firas",  "Leen"
        };
        var bidderLastNames = new[]
        {
            "Al-Hassan","Nabulsi","Shawish","Zoubi",   "Khouri",
            "Barhoum",  "Samman", "Musa",   "Khatib",  "Rahhal",
            "Shraideh", "Tamimi", "Hadidi", "Husseini","Daoud",
            "Jabri",    "Qasim",  "Rimawi", "Atwan",   "Safi",
            "Masri",    "Ayyad",  "Nimer",  "Banat",   "Khalayla",
            "Habashneh","Rawajfeh","Smadi", "Batayneh","Tawalbeh"
        };

        for (int i = 0; i < 30; i++)
        {
            var city = cities[i % cities.Length];
            var user = User.Create(
                email: $"bidder{i + 1}@mazadzone.com",
                passwordHash: hashedPassword,
                phoneNumber: $"079200{i + 1:0000}",
                firstName: bidderFirstNames[i],
                secondName: f.Name.FirstName(),
                thirdName: f.Name.FirstName(),
                lastName: bidderLastNames[i],
                roles: UserRole.Bidder
            ).Value;
            ClearDomainEvents(user);

            var address = Address.Create(
                city,
                $"{f.Address.StreetName()} St",
                f.Random.Int(1, 150).ToString(),
                $"Near {f.Company.CompanyName()}"
            ).Value;

            var natId = $"98{(i + 1):00}bidder{i + 1:00}".Substring(0, 10);
            var bidder = Bidder.CompleteProfile(user.Id, $"BID{i + 1:000}SEED{i:00}", address).Value;
            bidder.Verify();
            ClearDomainEvents(bidder);

            bidderUsers.Add(user);
            bidders.Add(bidder);
        }

        return (adminUsers, sellerUsers, sellers, bidderUsers, bidders);
    }

    // ── Auctions ───────────────────────────────────────────────────────────────

    private record OrderAuctionItem(
        Auction Auction,
        Bidder Winner,
        OrderStatus TargetStatus,
        bool AddFeedback,
        bool AddFeedbackReply,
        DisputeStatus? TargetDisputeStatus);

    private (List<Auction> auctions, List<OrderAuctionItem> orderItems)
        BuildAuctions(
            DateTime now,
            Faker f,
            List<Seller> sellers,
            List<Bidder> bidders,
            List<Category> subCats)
    {
        var allAuctions = new List<Auction>();
        var orderItems = new List<OrderAuctionItem>();

        var shippingAddr = Address.Create(
            "Amman", "King Abdullah II St", "15", "Near 4th Circle").Value;

        // ── Auction catalogue: 200 realistic items ─────────────────────────────
        // Each entry: (title, description, condition, itemStatus, category, startBid, minBid, imageUrl)
        var catalogue = BuildCatalogue(subCats);

        // ── Time buckets for 200 auctions ──────────────────────────────────────
        // Goal: spread across all statuses AND make the Active ones truly testable right now.

        // Pending — starts in future (this week)
        // Active  — started in past, ends in future (hours/days from now)
        // Ended   — started and ended in the past
        // Cancelled — mixed (seller/admin)

        // We'll allocate as follows out of 200:
        //   40  Pending  (starting tomorrow → 7 days out)
        //   60  Active   (started 1h–3 days ago, ends 1h–5 days from now)  ← biddable NOW
        //   50  Ended with bids → produce Orders in all states
        //   30  Ended without bids
        //   10  Cancelled by seller
        //   10  Cancelled by admin

        var pendingCount   = 40;
        var activeCount    = 60;
        var endedWithBids  = 50;
        var endedNoBids    = 30;
        var cancelledSeller = 10;
        var cancelledAdmin  = 10;

        var idx = 0; // catalogue index (wraps)

        // ── PENDING ────────────────────────────────────────────────────────────
        for (int i = 0; i < pendingCount; i++)
        {
            var entry = catalogue[idx++ % catalogue.Count];
            // Start between now + 1h and now + 20h, duration 4h to 15h (guaranteed before June 16, 23:59:59)
            var startOffset = TimeSpan.FromHours(1 + (i % 20));
            var duration    = TimeSpan.FromHours(4 + (i % 12));
            var start = now.Add(startOffset);
            var end   = start.Add(duration);

            var seller = sellers[i % sellers.Count];
            var auction = Auction.Create(
                sellerId: seller.Id,
                status:   entry.ItemStatus,
                condition: Description.Create(TruncateString(entry.Condition, 500)).Value,
                shippingAddress: shippingAddr,
                startBidAmount:  entry.StartBid,
                minBidAmount:    entry.MinBid,
                startTime: start,
                endTime:   end,
                title:       TruncateString(entry.Title, 45),
                description: TruncateString(entry.Description, 500),
                images: BuildImages(entry.ImageUrl),
                categoryId: entry.Category.Id
            ).Value;

            allAuctions.Add(auction);
        }

        // ── ACTIVE (biddable right now) ────────────────────────────────────────
        for (int i = 0; i < activeCount; i++)
        {
            var entry = catalogue[idx++ % catalogue.Count];

            // Started 1h–24h ago (between June 13 and June 14), ends 1h–48h from now (between June 14 and June 16)
            var startedAgo = TimeSpan.FromHours(1 + (i % 24));
            var endsIn     = TimeSpan.FromHours(1 + (i % 48));
            var start = now - startedAgo;
            var end   = now + endsIn;

            var seller = sellers[i % sellers.Count];
            var auction = Auction.Create(
                sellerId: seller.Id,
                status:   entry.ItemStatus,
                condition: Description.Create(TruncateString(entry.Condition, 500)).Value,
                shippingAddress: shippingAddr,
                startBidAmount:  entry.StartBid,
                minBidAmount:    entry.MinBid,
                startTime: start,
                endTime:   end,
                title:       TruncateString(entry.Title, 45),
                description: TruncateString(entry.Description, 500),
                images: BuildImages(entry.ImageUrl),
                categoryId: entry.Category.Id
            ).Value;

            // Transition to Active
            auction.MarkAsActive(start.AddSeconds(30));

            // Place 2–6 bids from different bidders
            int bidCount = 2 + (i % 5);
            decimal bidAmount = entry.StartBid;
            for (int b = 0; b < bidCount; b++)
            {
                var bidder = bidders[(i + b) % bidders.Count];
                // Ensure we don't bid with the seller as bidder on their own — skip if IDs match
                // (sellers also have bidder records; their bidder Id == seller Id == user Id)
                if (bidder.Id == seller.Id)
                    bidder = bidders[(i + b + 1) % bidders.Count];

                bidAmount += entry.MinBid + f.Random.Decimal(0, entry.MinBid);
                var bidTime = start.AddMinutes(30 + b * 45);
                // bidTime must be strictly before end and after start
                if (bidTime >= end) bidTime = end.AddMinutes(-10 - b);
                auction.PlaceBid(bidder.Id, Math.Round(bidAmount, 2), $"auth_{Guid.NewGuid():N}", bidTime);
            }

            allAuctions.Add(auction);
        }

        // ── ENDED WITH BIDS → Orders ───────────────────────────────────────────
        // We need all OrderStatus transitions + dispute states:
        var orderStatusCycle = new (OrderStatus Status, bool Feedback, bool Reply, DisputeStatus? Dispute)[]
        {
            (OrderStatus.Pending,   false, false, null),
            (OrderStatus.Confirmed, false, false, null),
            (OrderStatus.Shipped,   false, false, null),
            (OrderStatus.Delivered, true,  false, null),
            (OrderStatus.Delivered, true,  true,  null),
            (OrderStatus.Delivered, false, false, DisputeStatus.Open),
            (OrderStatus.Delivered, false, false, DisputeStatus.UnderReview),
            (OrderStatus.Delivered, false, false, DisputeStatus.Resolved),
            (OrderStatus.Canceled,  false, false, null),
        };

        for (int i = 0; i < endedWithBids; i++)
        {
            var entry  = catalogue[idx++ % catalogue.Count];
            var cycle  = orderStatusCycle[i % orderStatusCycle.Length];
            var seller = sellers[i % sellers.Count];

            // Ended 1h–10h ago (between June 13 and June 14), duration 10h–15h (guaranteed started on/after June 13)
            var endedAgo = TimeSpan.FromHours(1 + (i % 10));
            var duration = TimeSpan.FromHours(10 + (i % 6));
            var end      = now - endedAgo;
            var start    = end - duration;

            var auction = Auction.Create(
                sellerId: seller.Id,
                status:   entry.ItemStatus,
                condition: Description.Create(TruncateString(entry.Condition, 500)).Value,
                shippingAddress: shippingAddr,
                startBidAmount:  entry.StartBid,
                minBidAmount:    entry.MinBid,
                startTime: start,
                endTime:   end,
                title:       TruncateString(entry.Title, 45),
                description: TruncateString(entry.Description, 500),
                images: BuildImages(entry.ImageUrl),
                categoryId: entry.Category.Id
            ).Value;

            auction.MarkAsActive(start.AddSeconds(30));

            // Place 1–4 bids; last bidder is the winner
            int bidCount = 1 + (i % 4);
            decimal bidAmount = entry.StartBid;
            Bidder winner = bidders[(i + bidCount) % bidders.Count];
            for (int b = 0; b < bidCount; b++)
            {
                var bidder = bidders[(i + b) % bidders.Count];
                if (bidder.Id == seller.Id)
                    bidder = bidders[(i + b + 1) % bidders.Count];

                bidAmount += entry.MinBid + f.Random.Decimal(1, entry.MinBid * 2);
                var bidTime = start.AddHours(1 + b * 2);
                auction.PlaceBid(bidder.Id, Math.Round(bidAmount, 2), $"auth_{Guid.NewGuid():N}", bidTime);
                winner = bidder;
            }

            auction.MarkAsEnded(end.AddMinutes(5));

            allAuctions.Add(auction);
            orderItems.Add(new OrderAuctionItem(
                auction, winner,
                cycle.Status, cycle.Feedback, cycle.Reply, cycle.Dispute));
        }

        // ── ENDED WITHOUT BIDS ─────────────────────────────────────────────────
        for (int i = 0; i < endedNoBids; i++)
        {
            var entry  = catalogue[idx++ % catalogue.Count];
            var seller = sellers[i % sellers.Count];
            // Ended 1h–10h ago, duration 10h–15h (guaranteed started on/after June 13)
            var endedAgo = TimeSpan.FromHours(1 + (i % 10));
            var duration = TimeSpan.FromHours(10 + (i % 6));
            var end      = now - endedAgo;
            var start    = end - duration;

            var auction = Auction.Create(
                sellerId: seller.Id,
                status:   entry.ItemStatus,
                condition: Description.Create(TruncateString(entry.Condition, 500)).Value,
                shippingAddress: shippingAddr,
                startBidAmount:  entry.StartBid,
                minBidAmount:    entry.MinBid,
                startTime: start,
                endTime:   end,
                title:       TruncateString(entry.Title, 45),
                description: TruncateString(entry.Description, 500),
                images: BuildImages(entry.ImageUrl),
                categoryId: entry.Category.Id
            ).Value;

            auction.MarkAsActive(start.AddSeconds(30));
            auction.MarkAsEnded(end.AddMinutes(5));
            allAuctions.Add(auction);
        }

        // ── CANCELLED BY SELLER ────────────────────────────────────────────────
        for (int i = 0; i < cancelledSeller; i++)
        {
            var entry  = catalogue[idx++ % catalogue.Count];
            var seller = sellers[i % sellers.Count];
            // still pending (in future), fits strictly within June 14 to June 16
            var start  = now.AddHours(1 + (i % 20));
            var end    = start.AddHours(4 + (i % 12));

            var auction = Auction.Create(
                sellerId: seller.Id,
                status:   entry.ItemStatus,
                condition: Description.Create(TruncateString(entry.Condition, 500)).Value,
                shippingAddress: shippingAddr,
                startBidAmount:  entry.StartBid,
                minBidAmount:    entry.MinBid,
                startTime: start,
                endTime:   end,
                title:       TruncateString(entry.Title, 45),
                description: TruncateString(entry.Description, 500),
                images: BuildImages(entry.ImageUrl),
                categoryId: entry.Category.Id
            ).Value;

            // Cancel while Pending (seller can only cancel pending auctions)
            auction.MarkAsCancelled(
                now,
                "Seller withdrew the item due to change of plans or accidental damage to the item.");
            allAuctions.Add(auction);
        }

        // ── CANCELLED BY ADMIN ────────────────────────────────────────────────
        for (int i = 0; i < cancelledAdmin; i++)
        {
            var entry  = catalogue[idx++ % catalogue.Count];
            var seller = sellers[i % sellers.Count];
            // Start in past (June 13/14), ends in future (June 14/15/16)
            var start  = now.AddHours(-(1 + (i % 12)));
            var end    = now.AddHours(12 + (i % 36));

            var auction = Auction.Create(
                sellerId: seller.Id,
                status:   entry.ItemStatus,
                condition: Description.Create(TruncateString(entry.Condition, 500)).Value,
                shippingAddress: shippingAddr,
                startBidAmount:  entry.StartBid,
                minBidAmount:    entry.MinBid,
                startTime: start,
                endTime:   end,
                title:       TruncateString(entry.Title, 45),
                description: TruncateString(entry.Description, 500),
                images: BuildImages(entry.ImageUrl),
                categoryId: entry.Category.Id
            ).Value;

            auction.MarkAsActive(start.AddSeconds(30));
            auction.MarkAsCancelledByAdmin();
            allAuctions.Add(auction);
        }

        return (allAuctions, orderItems);
    }

    // ── Orders, Payments, Feedbacks, Disputes ─────────────────────────────────

    private async Task SeedOrdersAndPayments(
        List<OrderAuctionItem> items,
        List<Bidder> bidders,
        List<DisputeType> disputeTypes)
    {
        foreach (var item in items)
        {
            var auction    = item.Auction;
            var leadingBid = auction.CurrentLeadingBid;
            if (leadingBid is null) continue;

            var order = Order.Create(
                auction.Id,
                item.Winner.Id,
                leadingBid.Id,
                item.Winner.DefaultShippingAddress,
                leadingBid.Amount.Amount
            ).Value;

            var payment = Payment.Create(
                order.Id,
                item.Winner.Id,
                leadingBid.DepositAmount,
                leadingBid.Amount,
                MazadZone.Domain.Payments.PaymentConstants.DefaultPlatformFeePercentage
            ).Value;

            if (item.TargetStatus >= OrderStatus.Confirmed)
            {
                // Auth hold
                payment.RecordTransactionAttempt($"pi_auth_{order.Id.Value}", TransactionType.AuthorizationHold);
                payment.ResolveTransactionSuccess($"pi_auth_{order.Id.Value}");

                // Deposit capture
                payment.RecordTransactionAttempt($"pi_cap_{order.Id.Value}", TransactionType.DepositCaptured);
                payment.ResolveTransactionSuccess($"pi_cap_{order.Id.Value}");

                // Remaining amount
                payment.RecordTransactionAttempt($"pi_rem_{order.Id.Value}", TransactionType.RemainingAmountCapture);
                payment.ResolveTransactionSuccess($"pi_rem_{order.Id.Value}");

                order.Confirm();

                if (item.TargetStatus >= OrderStatus.Shipped)
                {
                    order.Ship();

                    if (item.TargetStatus >= OrderStatus.Delivered)
                    {
                        order.Deliver();

                        if (item.AddFeedback)
                        {
                            order.AddFeedback(
                                f.Random.Int(4, 5),
                                f.PickRandom(FeedbackTexts));

                            if (item.AddFeedbackReply)
                                order.ReplyToFeedback(f.PickRandom(FeedbackReplies));
                        }

                        if (item.TargetDisputeStatus is not null)
                        {
                            var disputeType = disputeTypes[f.Random.Int(0, disputeTypes.Count - 1)];
                            var dispute = Dispute.Open(
                                order.Id,
                                disputeType.Id,
                                Title.Create("Dispute regarding recent order").Value,
                                Description.Create(
                                    "The item received does not match the description in the listing.").Value,
                                new List<Image>()
                            );

                            if (item.TargetDisputeStatus == DisputeStatus.UnderReview)
                            {
                                dispute.UnderReview();
                            }
                            else if (item.TargetDisputeStatus == DisputeStatus.Resolved)
                            {
                                dispute.UnderReview();
                                dispute.Resolve(Resolution.Create(
                                    "After review, a partial refund of 20 JOD has been issued. Case closed.").Value);
                                SetPrivateProperty(dispute, "Status", DisputeStatus.Resolved);
                            }

                            SetPrivateProperty(order, "DisputeId", dispute.Id);
                            ClearDomainEvents(dispute);
                            await _dbContext.AddAsync(dispute);
                        }
                    }
                }
            }
            else if (item.TargetStatus == OrderStatus.Canceled)
            {
                // Pending then cancelled
                payment.RecordTransactionAttempt($"pi_pending_{order.Id.Value}", TransactionType.AuthorizationHold);
                order.Cancel();
            }
            else
            {
                // OrderStatus.Pending — just record authorization attempt
                payment.RecordTransactionAttempt($"pi_pending_{order.Id.Value}", TransactionType.AuthorizationHold);
            }

            ClearDomainEvents(order);
            ClearDomainEvents(payment);
            if (order.Feedback is not null) ClearDomainEvents(order.Feedback);

            await _dbContext.AddAsync(order);
            await _dbContext.AddAsync(payment);
        }

        await _dbContext.SaveChangesAsync();
    }

    // ── Catalogue: 200 realistic auction items ─────────────────────────────────

    private record CatalogueEntry(
        string Title,
        string Description,
        string Condition,
        ItemStatus ItemStatus,
        Category Category,
        decimal StartBid,
        decimal MinBid,
        string ImageUrl);

    private static List<Image> BuildImages(string imageUrl)
    {
        return new() { Image.Create(imageUrl, "Main product view", true).Value };
    }

    private static readonly Faker _f = new("en");

    private static List<CatalogueEntry> BuildCatalogue(List<Category> subCats)
    {
        return new List<CatalogueEntry>
        {
            // ─── SMARTPHONES (subCats[0]) ───────────────────────────────────────
            new("Apple iPhone 15 Pro Max 256GB – Natural Titanium",
                "Brand-new sealed box. Natural titanium design, A17 Pro chip, 48MP main camera, USB-C. Full Apple Jordan warranty included.",
                "Factory sealed, never opened.", ItemStatus.New, subCats[0], 850m, 20m,
                "https://cdn.dummyjson.com/products/images/smartphones/iPhone%206/thumbnail.png"),

            new("Samsung Galaxy S24 Ultra 512GB – Titanium Black",
                "Sealed. Snapdragon 8 Gen 3, 200MP camera system, built-in S Pen, 12GB RAM. Global variant.",
                "Factory sealed.", ItemStatus.New, subCats[0], 900m, 25m,
                "https://cdn.dummyjson.com/products/images/smartphones/Samsung%20Galaxy%20S10/thumbnail.png"),

            new("Apple iPhone 14 Pro 128GB – Deep Purple",
                "Used 8 months, excellent condition. Dynamic Island, 48MP camera. All original accessories.",
                "Excellent — no scratches, original box included.", ItemStatus.LikeNew, subCats[0], 540m, 15m,
                "https://cdn.dummyjson.com/products/images/smartphones/iPhone%206/thumbnail.png"),

            new("Google Pixel 8 Pro 256GB – Obsidian",
                "Lightly used for 3 months. Google AI features, 7 years OS updates, 50MP camera. Tempered glass applied from day one.",
                "Like new — barely used, screen protector on.", ItemStatus.LikeNew, subCats[0], 470m, 15m,
                "https://cdn.dummyjson.com/products/images/smartphones/Realme%20XT/thumbnail.png"),

            new("OnePlus 12 256GB – Flowy Emerald",
                "Pre-owned, 6 months use. Hasselblad camera tuning, 100W SUPERVOOC charging, 16GB RAM.",
                "Good — minor scuff on back glass under case.", ItemStatus.Good, subCats[0], 330m, 10m,
                "https://cdn.dummyjson.com/products/images/smartphones/Oppo%20A57/thumbnail.png"),

            new("Xiaomi 14 Ultra 512GB – White",
                "Imported from China. Leica optics, 1-inch main sensor, 90W wireless charging. Works on all Jordanian bands.",
                "Like new — purchased abroad, used 2 months.", ItemStatus.LikeNew, subCats[0], 720m, 20m,
                "https://cdn.dummyjson.com/products/images/smartphones/Oppo%20A57/thumbnail.png"),

            new("Apple iPhone 13 Mini 128GB – Starlight",
                "Owner upgraded, selling this as is. Works perfectly, battery health 91%. Charging cable included.",
                "Good — back has faint hairline under bright light.", ItemStatus.Good, subCats[0], 270m, 10m,
                "https://cdn.dummyjson.com/products/images/smartphones/iPhone%206/thumbnail.png"),

            new("Samsung Galaxy Z Fold 5 256GB – Phantom Black",
                "Foldable flagship, used 4 months with case. S Pen slot, 12GB RAM, 1TB storage. Perfect hinge.",
                "Excellent — fold crease normal, no screen damage.", ItemStatus.LikeNew, subCats[0], 950m, 30m,
                "https://cdn.dummyjson.com/products/images/smartphones/Samsung%20Galaxy%20S10/thumbnail.png"),

            new("Apple iPhone 12 64GB – Product RED",
                "Good working condition, sold by a student upgrading. Battery health 84%. Silicone case included.",
                "Good — minor corner dents from a drop.", ItemStatus.Good, subCats[0], 195m, 10m,
                "https://cdn.dummyjson.com/products/images/smartphones/iPhone%206/thumbnail.png"),

            new("Nothing Phone (2a) 256GB – Black",
                "Brand new import. Glyph interface, Snapdragon 7s Gen 2, 50MP camera. No warranty card but sealed.",
                "Factory sealed.", ItemStatus.New, subCats[0], 240m, 10m,
                "https://cdn.dummyjson.com/products/images/smartphones/Realme%20XT/thumbnail.png"),

            // ─── LAPTOPS (subCats[1]) ───────────────────────────────────────────
            new("Apple MacBook Pro 16\" M3 Max – Space Black",
                "36GB unified memory, 1TB SSD, M3 Max chip. Used 3 weeks for testing, essentially new. Full Apple warranty.",
                "Like new — opened once, screen protector applied.", ItemStatus.LikeNew, subCats[1], 2100m, 50m,
                "https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png"),

            new("Dell XPS 15 9530 – Intel i9 13th Gen",
                "OLED 3.5K display, 32GB DDR5, 1TB NVMe. Owner switching to Mac. Excellent for video editing and development.",
                "Good — normal use marks on palmrest.", ItemStatus.Good, subCats[1], 980m, 25m,
                "https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png"),

            new("ASUS ROG Zephyrus G14 (2024) – Eclipse Gray",
                "AMD Ryzen 9 8945HS, RTX 4070, 32GB RAM, 1TB SSD. Latest gen gaming powerhouse. 1 year warranty remaining.",
                "Like new — 2 months use, always on a cooling pad.", ItemStatus.LikeNew, subCats[1], 1150m, 30m,
                "https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png"),

            new("Apple MacBook Air 15\" M2 – Midnight",
                "8GB RAM, 256GB SSD. Used by a graphic design student. AppleCare+ until 2026. Battery health 97%.",
                "Excellent — screen and chassis pristine.", ItemStatus.LikeNew, subCats[1], 780m, 20m,
                "https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png"),

            new("Lenovo ThinkPad X1 Carbon Gen 11",
                "Intel i7-1365U, 16GB LPDDR5, 512GB SSD, WUXGA IPS. Business workhorse with MIL-SPEC durability.",
                "Good — minor key legends fading on 'E' key.", ItemStatus.Good, subCats[1], 650m, 20m,
                "https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png"),

            new("HP Spectre x360 16\" OLED – Nightfall Black",
                "Intel i7-13700H, 32GB DDR5, 1TB SSD, 120Hz OLED touchscreen. 2-in-1 laptop convertible.",
                "Like new — lightly used for university.", ItemStatus.LikeNew, subCats[1], 890m, 25m,
                "https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png"),

            new("MSI Raider GE78 HX – Titanium Blue",
                "Intel i9-14900HX, RTX 4090 Laptop GPU, 64GB DDR5, 2TB SSD. Serious gaming rig.",
                "Good — 6 months old, slight thermal paste smell on startup.", ItemStatus.Good, subCats[1], 2400m, 60m,
                "https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png"),

            new("Acer Swift 3 14\" – Silver",
                "Intel i5-1235U, 8GB RAM, 512GB SSD, 14\" FHD IPS. Thin and light everyday laptop.",
                "Good — scratch on lid from bag zipper.", ItemStatus.Good, subCats[1], 280m, 10m,
                "https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png"),

            new("Surface Pro 9 with Keyboard Bundle",
                "Intel i5, 8GB RAM, 128GB SSD. Comes with official keyboard cover and Surface Pen. Compact workstation.",
                "Like new — used for digital art, all accessories included.", ItemStatus.LikeNew, subCats[1], 720m, 20m,
                "https://cdn.dummyjson.com/products/images/tablets/Samsung%20Galaxy%20Tab%20S8%20Plus%20Grey/thumbnail.png"),

            new("Apple MacBook Pro 14\" M2 Pro – Silver",
                "16GB RAM, 512GB SSD. Compact powerhouse for developers. AppleCare until 2025.",
                "Excellent — no blemishes, MagSafe cable included.", ItemStatus.LikeNew, subCats[1], 1250m, 30m,
                "https://cdn.dummyjson.com/products/images/laptops/Apple%20MacBook%20Pro%2014%20Inch%20Space%20Grey/thumbnail.png"),

            // ─── CAMERAS (subCats[2]) ───────────────────────────────────────────
            new("Sony Alpha A7 IV Mirrorless Body",
                "33MP full-frame sensor, 4K 60fps, real-time tracking AF. Used for 6 months by a professional photographer.",
                "Excellent — shutter count 4,200. No issues.", ItemStatus.LikeNew, subCats[2], 1600m, 40m,
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"),

            new("Canon EOS R6 Mark II + RF 24-105mm Kit",
                "Full-frame, 40fps burst, in-body stabilization. Complete kit with lens, batteries, and charger.",
                "Like new — 2,800 actuations, full kit.", ItemStatus.LikeNew, subCats[2], 2200m, 50m,
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"),

            new("Nikon Z6 III Mirrorless Body",
                "24MP partially stacked CMOS, 6K RAW video, 120fps at 1080p. Top wildlife and event camera.",
                "Good — some wear on grip from extended use.", ItemStatus.Good, subCats[2], 1900m, 50m,
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"),

            new("GoPro Hero 12 Black + Accessories Bundle",
                "Waterproof to 10m, 5.3K video, HyperSmooth 6.0 stabilization. Comes with chest mount, head strap, and 3 batteries.",
                "Like new — 5 short trips, all accessories included.", ItemStatus.LikeNew, subCats[2], 310m, 10m,
                "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80"),

            new("DJI Osmo Pocket 3 Creator Combo",
                "3-axis gimbal, 4K 120fps, 1-inch sensor. Includes ND filters, wireless microphone, wide-angle addon.",
                "Like new — barely used for a wedding shoot.", ItemStatus.LikeNew, subCats[2], 470m, 15m,
                "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80"),

            new("Fujifilm X-T5 Body – Black",
                "40.2MP X-Trans CMOS 5 HR, 7-stop IBIS, film simulation modes. Beloved by street and portrait photographers.",
                "Excellent — 1,100 actuations, all original accessories.", ItemStatus.LikeNew, subCats[2], 1350m, 30m,
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"),

            new("DJI Mini 4 Pro Fly More Combo",
                "249g, 4K 60fps HDR, omnidirectional obstacle sensing, 34-min flight. 3 batteries + charger included.",
                "Like new — 12 total flights, no crashes.", ItemStatus.LikeNew, subCats[2], 650m, 20m,
                "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=600&q=80"),

            // ─── AUDIO & HEADPHONES (subCats[3]) ────────────────────────────────
            new("Sony WH-1000XM5 Wireless Headphones",
                "Industry-leading ANC. Multipoint Bluetooth, 30h battery, foldable. Sealed box.",
                "Factory sealed — gift that went unopened.", ItemStatus.New, subCats[3], 240m, 10m,
                "https://cdn.dummyjson.com/products/images/mobile-accessories/Beats%20Flex%20Wireless%20Earphones/thumbnail.png"),

            // ─── CARS (subCats[30]) ─────────────────────────────────────────────
            new("2021 Porsche 911 Carrera S – Guards Red",
                "3.0L twin-turbo flat-six, 450HP, PDK. 28,000 km. Full PCCB option, sport exhaust, Burmester audio. Perfect history.",
                "Excellent — dealer serviced, single owner, no accidents.", ItemStatus.LikeNew, subCats[30], 95000m, 2000m,
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80"),

            new("2019 Mercedes-AMG C63 S – Obsidian Black",
                "510HP V8 biturbo, 9-speed MCT. 55,000 km. AMG driver package, panorama roof, 360 camera.",
                "Good — full service history, new rear tires 2024.", ItemStatus.Good, subCats[30], 62000m, 1500m,
                "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=600&q=80"),

            new("2023 BMW M4 Competition – Sao Paulo Yellow",
                "510HP S58 engine, xDrive, 8-speed M Steptronic. 12,000 km. Carbon roof, Harman Kardon, M Carbon seats.",
                "Like new — single owner, warranty intact.", ItemStatus.LikeNew, subCats[30], 88000m, 2000m,
                "https://images.unsplash.com/photo-1605559424843-9e4c228bf1c2?auto=format&fit=crop&w=600&q=80"),

            new("2020 Audi RS 6 Avant – Nardo Gray",
                "600HP twin-turbo V8, quattro, air suspension. 65,000 km. Full Audi history, panoramic roof, HUD.",
                "Good — minor paint chip on bumper, full records.", ItemStatus.Good, subCats[30], 71000m, 1500m,
                "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&w=600&q=80"),

            new("2022 Ferrari F8 Tributo – Rosso Corsa",
                "720HP V8, 7-speed DCT. 8,000 km. Lifting system, carbon fibre package, Daytona sport seats.",
                "Excellent — Ferrari-certified pre-owned.", ItemStatus.LikeNew, subCats[30], 285000m, 5000m,
                "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&w=600&q=80"),

            new("2022 Toyota Land Cruiser 300 Series – White",
                "3.5L twin-turbo V6, 415HP, 4WD. 18,000 km. Full option GR Sport. Export-spec.",
                "Like new — single owner, all services at dealer.", ItemStatus.LikeNew, subCats[30], 115000m, 3000m,
                "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=600&q=80"),

            new("2021 Range Rover Sport P400 HSE – Fuji White",
                "3.0L inline-6 MHEV, 400HP, air suspension. 42,000 km. Panoramic sunroof, HUD, 360 cam.",
                "Good — full dealer service history, no accidents.", ItemStatus.Good, subCats[30], 82000m, 2000m,
                "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&w=600&q=80"),

            new("2018 Lamborghini Huracán LP580-2 – Arancio Borealis",
                "5.2L V10, 580HP, rear-wheel drive. 22,000 km. Lift system, camera park. Single expat owner.",
                "Excellent — major service completed, no accidents.", ItemStatus.LikeNew, subCats[30], 480000m, 10000m,
                "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=600&q=80"),

            // ─── MOTORCYCLES (subCats[31]) ──────────────────────────────────────
            new("2022 Ducati Panigale V4 S – Winter Test Livery",
                "1,103cc V4 Desmosedici Stradale. 214HP. Öhlins electronic suspension, Brembo Stylema brakes. 4,200 km.",
                "Excellent — track day twice, no falls, full service.", ItemStatus.LikeNew, subCats[31], 28000m, 600m,
                "https://cdn.dummyjson.com/products/images/motorcycle/Sportbike%20Motorcycle/thumbnail.png"),

            new("2021 KTM 890 Duke R – Orange",
                "890cc parallel twin, 121HP, WP APEX PRO suspension, supermoto ABS. 9,000 km.",
                "Good — crash bars added, minor bar end scratch.", ItemStatus.Good, subCats[31], 8500m, 200m,
                "https://cdn.dummyjson.com/products/images/motorcycle/Sportbike%20Motorcycle/thumbnail.png"),

            new("2023 Honda CB1000R Black Edition",
                "998cc four-cylinder, 143HP. Neo Sports Café design. LED lighting, Showa suspension. 3,000 km.",
                "Like new — warranty until 2025, always garaged.", ItemStatus.LikeNew, subCats[31], 12500m, 300m,
                "https://cdn.dummyjson.com/products/images/motorcycle/Sportbike%20Motorcycle/thumbnail.png"),

            new("2020 Triumph Scrambler 1200 XC – Sandstorm",
                "1,200cc parallel twin, 89HP. Adventure-ready with Showa long-travel forks. 18,000 km.",
                "Good — handlebar scratch, new rear tyre.", ItemStatus.Good, subCats[31], 9200m, 200m,
                "https://cdn.dummyjson.com/products/images/motorcycle/Sportbike%20Motorcycle/thumbnail.png"),

            new("1950s Royal Enfield Bullet 350 – Restored",
                "Fully restored 1952 RE Bullet 350cc. New exhaust, re-chromed, new seat. Starts first kick.",
                "Excellent — museum-quality restoration.", ItemStatus.LikeNew, subCats[31], 4800m, 100m,
                "https://cdn.dummyjson.com/products/images/motorcycle/Sportbike%20Motorcycle/thumbnail.png"),

            new("Breitling Navitimer B01 Chronograph 46mm",
                "Chronometer-certified in-house movement, pilot-style dial, stainless steel. Full set 2022.",
                "Excellent — worn occasionally, serviced 2024.", ItemStatus.LikeNew, subCats[6], 4200m, 100m,
                "https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80"),

            new("Moncler Maya 70 Down Jacket – Black XL",
                "Iconic puffer with RECCO detector, 90/10 goose down fill. Original box, tags on.",
                "Brand new — received as gift, wrong size.", ItemStatus.New, subCats[8], 690m, 20m,
                "https://images.unsplash.com/photo-1544923246-77307dd654cb?auto=format&fit=crop&w=600&q=80"),

            new("Nike Air Max 95 OG – Neon Yellow US11",
                "OG Neon colourway. DS pair purchased from SNKRS. OG box, extra laces.",
                "Deadstock — never worn.", ItemStatus.New, subCats[9], 310m, 10m,
                "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=600&q=80"),

            new("2018 Lamborghini Huracán LP580-2 – Arancio Borealis",
                "5.2L V10, 580HP, rear-wheel drive. 22,000 km. Lift system, camera park. Single expat owner.",
                "Excellent — major service completed, no accidents.", ItemStatus.LikeNew, subCats[30], 480000m, 10000m,
                "https://images.unsplash.com/photo-1621135802920-133df287f89c?auto=format&fit=crop&w=600&q=80"),

            new("2022 Kawasaki Ninja ZX-10R – Lime Green",
                "998cc inline-four, 203HP. KTRC traction control, launch control, IMU cornering ABS. 5,500 km.",
                "Excellent — no modifications, full dealer service.", ItemStatus.LikeNew, subCats[31], 16500m, 400m,
                "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=600&q=80"),

            new("HRE FlowForm FF01 Wheels – 20\" – Anthracite Set of 4",
                "Lightweight flow-formed alloy. 5×112 bolt pattern, ET35, 9J front 10.5J rear. Fits Mercedes, BMW, Audi.",
                "Like new — off a C63 S, driven 8,000km, no kerb damage.", ItemStatus.LikeNew, subCats[34], 1800m, 50m,
                "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=600&q=80"),

            new("Mid-Century Modern Original Oil – Nude Figure",
                "Oil on canvas, 80×60cm, signed by European artist, undated (est. 1960s). Frame original.",
                "Good — age cracking on varnish, colours vivid.", ItemStatus.Good, subCats[18], 1100m, 30m,
                "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&w=600&q=80"),

            new("Signed Roger Federer Wimbledon 2019 Racket",
                "Wilson Pro Staff RF 97 Autograph signed at post-match signing. ACOA authenticated.",
                "Excellent — display frame included.", ItemStatus.LikeNew, subCats[20], 3800m, 80m,
                "https://images.unsplash.com/photo-1617083934555-ac7d4fee8909?auto=format&fit=crop&w=600&q=80"),

            new("1970s Olympus OM-1 Film Camera + 50mm f/1.4",
                "Fully mechanical SLR. Serviced and CLA'd. Light seals replaced. Film tested.",
                "Good — some brassing on top plate, viewfinder clear.", ItemStatus.Good, subCats[19], 195m, 5m,
                "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80"),

            new("1-Bedroom Apartment – Jabal Amman – Furnished",
                "75sqm, first circle, Old Amman charm, exposed stone walls. Perfect for Airbnb. Rental income proven.",
                "Good — partially renovated, needs minor updates.", ItemStatus.Good, subCats[17], 35000m, 1000m,
                "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80"),

            new("Luxury Chalet – Zara Peak, Ajloun – Mountain View",
                "3-bed chalet, 220sqm. Fireplace, stone interior, 200sqm garden. Walking distance to forest trails.",
                "Excellent — built 2021, holiday use only.", ItemStatus.LikeNew, subCats[17], 140000m, 3000m,
                "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80"),

            new("Warehouse Unit – Industrial Zone, Sahab",
                "1,200sqm industrial warehouse, 8m ceiling height, 3-phase electricity, loading dock.",
                "Good — currently vacant, ready for occupation.", ItemStatus.Good, subCats[17], 210000m, 5000m,
                "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80"),
        };
    }

    // ── Feedback copy ──────────────────────────────────────────────────────────

    private static readonly Faker f = new("en");

    private static readonly string[] FeedbackTexts =
    {
        "Absolutely delighted with this purchase. Exactly as described and packaged beautifully.",
        "Great seller, fast delivery. The item is in perfect condition. Highly recommend.",
        "Smooth transaction. Item is authentic and exactly what I was looking for. 5 stars!",
        "Very satisfied. The seller was communicative and shipping was faster than expected.",
        "Top quality item. Worth every JOD. Will definitely buy from this seller again.",
        "Excellent packaging and prompt shipping. Item was pristine. No complaints at all.",
        "Really happy with my purchase. Seller answered all my questions quickly. A+",
        "The item surpassed my expectations. Clear photos matched reality. Trustworthy seller.",
    };

    private static readonly string[] FeedbackReplies =
    {
        "Thank you so much for your kind words! It was a pleasure doing business with you.",
        "Really appreciate the positive feedback! Enjoy your new item and feel free to reach out anytime.",
        "So glad you are happy! Your satisfaction is our priority. Thanks for being a great buyer.",
        "Thank you! Always a pleasure dealing with genuine buyers. Hope you enjoy it!",
        "Appreciate it! Wishing you the best with your new purchase.",
    };
}
