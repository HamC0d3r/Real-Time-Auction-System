using MazadZone.Domain.Auctions;
using MazadZone.Domain.Bidders;
using MazadZone.Domain.Categories;
using MazadZone.Domain.Orders;
using MazadZone.Domain.Sellers;
using MazadZone.Domain.Users;
using MazadZone.Domain.Users.Entities;
using MazadZone.Infrastructure.Authentication;
using Microsoft.EntityFrameworkCore;

namespace MazadZone.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options)
    {
    }

    public DbSet<Order> Orders { get; set; } = null!;
    public DbSet<SigningKey> SigningKeys { get; set; } = null!;
    public DbSet<HashedRefreshToken> RefreshTokens { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;
    public DbSet<Feedback> Feedbacks { get; set; } = null!;
    public DbSet<Dispute> Disputes { get; set; } = null!;
    public DbSet<Category> Categories { get; set; } = null!;
    public DbSet<Bidder> Bidders { get; set; } = null!;
    public DbSet<Seller> Sellers { get; set; } = null!;
    public DbSet<Auction> Auctions { get; set; } = null!;
    public DbSet<Item> Items { get; set; } = null!;
    public DbSet<Bid> Bids { get; set; } = null!;



    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}