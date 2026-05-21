using Bogus;
using MazadZone.Domain.Auctions;
using MazadZone.Domain.Bidders;
using MazadZone.Domain.Categories;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Sellers;
using MazadZone.Domain.Users;
using MazadZone.Domain.Users.ValueObjects;
using MazadZone.Domain.Shared.ValueObjects;
using MazadZone.Domain.ValueObjects;
using MazadZone.Domain.Payments.Enums;
using MzadZone.Domain.Payments;
using MzadZone.Domain.Payments.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Reflection;

namespace MazadZone.Infrastructure.Persistence.Seeding;

public class DatabaseSeeder : IDatabaseSeeder
{
    private readonly AppDbContext _dbContext;
    private readonly ILogger<DatabaseSeeder> _logger;

    public DatabaseSeeder(AppDbContext dbContext, ILogger<DatabaseSeeder> logger)
    {
        _dbContext = dbContext;
        _logger = logger;
    }

    private void ClearDomainEvents(object entity)
    {
        try
        {
            if (entity == null) return;
            var method = entity.GetType().GetMethod("ClearDomainEvents", BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.FlattenHierarchy);
            method?.Invoke(entity, null);
        }
        catch { /* ignore safely */ }
    }

    public async Task SeedAsync()
    {
        if (await _dbContext.Set<User>().AnyAsync()) return;

        // Extend timeout for heavy data seeding
        _dbContext.Database.SetCommandTimeout(TimeSpan.FromMinutes(10));

        Randomizer.Seed = new Random(2026);
        var f = new Faker();

        _logger.LogInformation("Starting database seeding...");

        // =================================================================
        // PHASE 1: CATEGORIES
        // =================================================================
        _logger.LogInformation("Seeding Categories...");
        var rootCategories = new List<Category>();
        for (int i = 0; i < 10; i++)
        {
            rootCategories.Add(Category.Create(f.Commerce.Categories(1)[0], f.Lorem.Sentence()).Value);
        }

        var subCategories = new List<Category>();
        foreach (var rootCategory in rootCategories)
        {
            for (int i = 0; i < 4; i++) // 4 sub-categories per root
            {
                subCategories.Add(Category.Create(f.Commerce.ProductName(), f.Lorem.Sentence(), rootCategory.Id).Value);
            }
        }
        var allCategories = rootCategories.Concat(subCategories).ToList();
        
        foreach (var c in allCategories) ClearDomainEvents(c);
        
        await _dbContext.AddRangeAsync(allCategories);
        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("✅ Categories seeded.");

        // =================================================================
        // PHASE 2: USERS, BIDDERS, SELLERS
        // =================================================================
        _logger.LogInformation("Seeding Users, Bidders, and Sellers...");
        var users = new List<User>();
        var bidders = new List<Bidder>();
        var sellers = new List<Seller>();

        for (int i = 0; i < 1500; i++) // 1500 robust users
        {
            var user = User.Create(
                email: f.Internet.Email(uniqueSuffix: i.ToString()),
                passwordHash: "Hash123!",
                phoneNumber: f.Phone.PhoneNumber("079#######"),
                firstName: f.Name.FirstName(),
                secondName: f.Name.FirstName(), // Assuming these are required
                thirdName: f.Name.FirstName(),  // Assuming these are required
                lastName: f.Name.LastName(),
                roles: new HashSet<UserRole> { UserRole.Bidder }
            ).Value;
            users.Add(user);

            // All users become bidders
            var address = Address.Create(f.Address.City(), f.Address.StreetName(), f.Address.BuildingNumber(), "Near mall").Value;
            var bidder = Bidder.CompleteProfile(user.Id, f.Random.Replace("##########"), address).Value;
            bidder.Verify();
            bidders.Add(bidder);

            // Make ~20% of bidders also sellers
            if (i % 4 == 0)
            {
                user.AddRole(UserRole.Seller);
                var seller = Seller.BecomeSeller(bidder.Id, f.Finance.Account(12), f.Random.Replace("##########")).Value;
                seller.Verify();
                sellers.Add(seller);
            }
        }
        
        foreach (var u in users) ClearDomainEvents(u);
        foreach (var b in bidders) ClearDomainEvents(b);
        foreach (var s in sellers) ClearDomainEvents(s);
        
        await _dbContext.AddRangeAsync(users);
        await _dbContext.AddRangeAsync(bidders);
        await _dbContext.AddRangeAsync(sellers);
        await _dbContext.SaveChangesAsync();
        _logger.LogInformation("✅ Users, Bidders, and Sellers seeded.");

        // =================================================================
        // PHASE 3: AUCTIONS AND BIDS
        // =================================================================
        _logger.LogInformation("Seeding 10,000 Auctions and heavily simulating Bids, Orders, and Payments...");
        
        int totalAuctions = 10000;
        int batchSize = 1000;
        int numberOfBatches = totalAuctions / batchSize;

        for (int batch = 0; batch < numberOfBatches; batch++)
        {
            _logger.LogInformation($"--- Processing Batch {batch + 1}/{numberOfBatches} (1,000 Auctions) ---");
            
            var auctions = new List<Auction>();
            var orders = new List<Order>();
            var payments = new List<Payment>();
            var bidsToAdd = new List<object>(); // Explicit tracking for bids

            for (int i = 0; i < batchSize; i++)
            {
                try
                {
                    var isHistorical = f.Random.Bool(0.75f); // 75% historical for heavy order/payment generation
                    var startTime = isHistorical ? f.Date.Past(1).ToUniversalTime() : f.Date.Recent(5).ToUniversalTime();
                    var endTime = startTime.AddDays(f.Random.Int(3, 10)).ToUniversalTime();

                    var seller = f.PickRandom(sellers);
                    var category = f.PickRandom(subCategories);
                    var address = Address.Create(f.Address.City(), f.Address.StreetName(), f.Address.BuildingNumber(), "Landmark").Value;

                    var startAmount = Math.Round(f.Random.Decimal(50, 500), 2);
                    var minBidAmount = Math.Round(f.Random.Decimal(5, 20), 2);

                    var auctionResult = Auction.Create(
                        sellerId: seller.Id,
                        shippingAddress: address,
                        startBidAmount: Money.Create(startAmount, Currency.Jod).Value.Amount,
                        minBidAmount: Money.Create(minBidAmount, Currency.Jod).Value.Amount,
                        currency: Currency.Jod,
                        startTime: startTime,
                        endTime: endTime,
                        title: f.Commerce.ProductName(),
                        description: f.Commerce.ProductDescription(),
                        images: new List<Image> 
                        { 
                            Image.Create(f.Image.PicsumUrl(), "Main View").Value,
                            Image.Create(f.Image.PicsumUrl(), "Angle View").Value,
                            Image.Create(f.Image.PicsumUrl(), "Detail View").Value
                        },
                        categoryId: category.Id
                    );

                    if (auctionResult.IsFailure) continue;
                    var auction = auctionResult.Value;

                    // --- SIMULATE BIDS ---
                    Bidder finalWinningBidder = null;
                    
                    if (startTime < DateTime.UtcNow)
                    {
                        var simTime = startTime.AddMinutes(f.Random.Int(1, 10));
                        var activeResult = auction.MarkAsActive(simTime); 
                        
                        // If it fails because it's ALREADY active, we treat it as a success so bids can be placed
                        bool isAuctionActive = activeResult.IsSuccess || activeResult.TopError?.Code == AuctionErrorCodes.CannotStart;
                        if (!isAuctionActive) _logger.LogWarning($"MarkAsActive failed: {activeResult.TopError?.Message}");

                        var biddersWhoCanBid = bidders.Where(b => b.Id.Value != seller.Id.Value).ToList();
                        if (biddersWhoCanBid.Any() && isAuctionActive)
                        {
                            int numBids = f.Random.Int(5, 25); // Heavy bid simulation
                            
                            Bidder previousBidder = null;
                            decimal currentLeadingAmount = startAmount;
                            
                            for (int b = 0; b < numBids; b++)
                            {
                                simTime = simTime.AddMinutes(f.Random.Int(5, 120));
                                if (simTime >= endTime || (!isHistorical && simTime >= DateTime.UtcNow)) break;

                                var bidder = f.PickRandom(biddersWhoCanBid);
                                
                                // Ensure we massively clear the minimum increment constraints
                                var nextBidAmount = Math.Round(currentLeadingAmount + f.Random.Decimal(25, 100), 2);

                                var checkResult = auction.CheckPlaceBid(bidder.Id, nextBidAmount, simTime);

                                if (checkResult.IsSuccess && checkResult.Value != null)
                                {
                                    var authId = $"AUTH_{f.Random.AlphaNumeric(12)}";
                                    var placeResult = auction.PlaceVerifiedBid(checkResult.Value, authId, simTime);
                                    
                                    if (placeResult.IsSuccess)
                                    {
                                        bidsToAdd.Add(checkResult.Value); // Explicitly track Bid entity

                                        // IMPORTANT: Release the OUTBID bidder's funds so they don't hit credit limits!
                                        if (previousBidder != null) {
                                            previousBidder.ReleaseActiveBid(Money.Create(currentLeadingAmount, Currency.Jod).Value);
                                        }
                                        
                                        var bidMoney = Money.Create(nextBidAmount, Currency.Jod).Value;
                                        bidder.AddActiveBid(bidMoney);
                                        
                                        previousBidder = bidder;
                                        currentLeadingAmount = nextBidAmount;
                                    }
                                    else
                                    {
                                        _logger.LogWarning($"PlaceVerifiedBid failed: {placeResult.TopError?.Message}");
                                    }
                                }
                                else if (checkResult.IsFailure)
                                {
                                    _logger.LogWarning($"CheckPlaceBid failed: {checkResult.TopError?.Message}");
                                }
                            }
                            
                            finalWinningBidder = previousBidder;
                        }

                        if (isHistorical && isAuctionActive)
                        {
                            var endResult = auction.MarkAsEnded(endTime.AddMinutes(f.Random.Int(1, 60)));
                            if (endResult.IsFailure && endResult.TopError?.Code != AuctionErrorCodes.CannotEnd && endResult.TopError?.Code != AuctionErrorCodes.AlreadyEnded) 
                                _logger.LogWarning($"MarkAsEnded failed: {endResult.TopError?.Message}");
                            
                            // Auction ended: Release the winning bidder's active hold (it converts to Order/Payment)
                            if (finalWinningBidder != null && auction.CurrentLeadingBid?.Amount != null) 
                            {
                                finalWinningBidder.ReleaseActiveBid(auction.CurrentLeadingBid.Amount);
                            }
                        }
                    }
                    auctions.Add(auction);

                    // --- SIMULATE ORDERS, PAYMENTS, DISPUTES, FEEDBACKS ---
                    if (auction.IsEnded && auction.HasBids && finalWinningBidder != null)
                    {
                        var leadingBid = auction.CurrentLeadingBid;
                        if (leadingBid == null || leadingBid.Amount == null) continue; 

                        finalWinningBidder.RecordWin();

                        var orderResult = Order.Create(
                            auction.Id,
                            finalWinningBidder.Id,
                            leadingBid.Id,
                            finalWinningBidder.DefaultShippingAddress,
                            leadingBid.Amount.Amount
                        );

                        if (orderResult.IsSuccess && orderResult.Value != null)
                        {
                            var order = orderResult.Value;
                            var paymentResult = Payment.Create(order.Id, UserId.From(finalWinningBidder.Id.Value), leadingBid.Amount);
                            
                            if (paymentResult.IsSuccess && paymentResult.Value != null)
                            {
                                var payment = paymentResult.Value;

                                // Complete Gateway Simulation sequence
                                string authIntentId = $"pi_{f.Random.AlphaNumeric(24)}";
                                payment.RecordTransactionAttempt(authIntentId, TransactionType.AuthorizationHold);
                                payment.ResolveTransactionSuccess(authIntentId);
                                
                                string depositIntentId = $"pi_{f.Random.AlphaNumeric(24)}";
                                payment.RecordTransactionAttempt(depositIntentId, TransactionType.DepositCaptured);
                                payment.ResolveTransactionSuccess(depositIntentId);

                                string remainingIntentId = $"pi_{f.Random.AlphaNumeric(24)}";
                                payment.RecordTransactionAttempt(remainingIntentId, TransactionType.RemainingAmountCapture);
                                payment.ResolveTransactionSuccess(remainingIntentId);

                                if (payment.Status == PaymentStatus.Completed)
                                {
                                    order.Confirm();
                                    finalWinningBidder.RecordPaymentSuccess(leadingBid.Amount);

                                    var shippingRoll = f.Random.Int(1, 100);
                                    if (shippingRoll > 15) // 85% get shipped
                                    {
                                        order.Ship();

                                        if (shippingRoll > 35) // Most get delivered
                                        {
                                            order.Deliver();

                                            // High probability feedback/disputes for robust test data
                                            var postDeliveryRoll = f.Random.Int(1, 100);
                                            if (postDeliveryRoll > 50) // 50% chance of feedback
                                            {
                                                var feedbackResult = order.AddFeedback(f.Random.Int(3, 5), f.Rant.Review());
                                                if (feedbackResult.IsSuccess && order.Feedback != null)
                                                {
                                                    _dbContext.Add(order.Feedback); // Explicitly track
                                                }
                                            }
                                            else if (postDeliveryRoll < 20) // 20% chance of dispute
                                            {
                                                var disputeResult = order.OpenDispute(f.Lorem.Sentence());
                                                if (disputeResult.IsSuccess && order.Dispute != null)
                                                {
                                                    _dbContext.Add(order.Dispute); // Explicitly track
                                                    
                                                    if (f.Random.Bool())
                                                    {
                                                        order.ResolveDispute("Resolved: Refund issued to buyer.");
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                payments.Add(payment);
                            }
                            else
                            {
                                _logger.LogWarning($"Payment.Create failed: {paymentResult.TopError?.Message}");
                            }
                            orders.Add(order);
                        }
                        else
                        {
                            _logger.LogWarning($"Order.Create failed: {orderResult.TopError?.Message}");
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Failed to simulate auction/order flow for index {Index}. Skipping this item.", i);
                }
            }

            // Pre-process Domain Events to avoid network/worker crashes
            foreach (var a in auctions) ClearDomainEvents(a);
            foreach (var o in orders) ClearDomainEvents(o);
            foreach (var p in payments) ClearDomainEvents(p);
            foreach (var b in bidsToAdd) ClearDomainEvents(b);

            // Sync and save the Batch
            _dbContext.UpdateRange(bidders);
            await _dbContext.AddRangeAsync(auctions);
            await _dbContext.AddRangeAsync(bidsToAdd); // Insert Bids explicitly
            await _dbContext.AddRangeAsync(orders);
            await _dbContext.AddRangeAsync(payments);
            
            await _dbContext.SaveChangesAsync();

            // Clear EF Core tracking for the massive lists to prevent OutOfMemory issues
            foreach(var entity in auctions) _dbContext.Entry(entity).State = EntityState.Detached;
            foreach(var entity in bidsToAdd) _dbContext.Entry(entity).State = EntityState.Detached;
            foreach(var entity in orders) _dbContext.Entry(entity).State = EntityState.Detached;
            foreach(var entity in payments) _dbContext.Entry(entity).State = EntityState.Detached;
            
            _logger.LogInformation($"✅ Batch {batch + 1} completed.");
        }

        _logger.LogInformation("🎉 Database seeding completed successfully.");
    }
}