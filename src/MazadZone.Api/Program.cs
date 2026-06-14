#region  Usings
using MazadZone.Api;
using MazadZone.Api.Endpoints.Auctions;
using MazadZone.Api.Endpoints.Bidders;
using MazadZone.Api.Endpoints.Notifications;
using MazadZone.Api.Middlewares;
using MazadZone.Infrastructure.Persistence;
using MazadZone.Infrastructure.Persistence.Seeding;
using Serilog;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using MazadZone.Api.Endpoints.Orders;
using MazadZone.Api.Endpoints.Categories;
using MazadZone.Api.Endpoints.Payments;
using MazadZone.Api.Endpoints.Users;
using MazadZone.Api.Endpoints.Sellers;
using MazadZone.Api.Endpoints.SellerDashboard;
using MazadZone.Api.Endpoints.Auth;
using MazadZone.Infrastructure.RealTime.Hubs;
using Hangfire;
using MazadZone.Api.Endpoints.ChatAgent;
using MazadZone.Api.Endpoints.Disputes;
using MazadZone.Api.Endpoints.DisputeTypes;
using MazadZone.Api.Endpoints.Dashboard;
using MazadZone.Api.Endpoints.Emails;
using MazadZone.Api.Configuration;
#endregion

Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateBootstrapLogger();
try
{
    Log.Information("Starting MazadZone Application.");

    var builder = WebApplication.CreateBuilder(args);

    builder.Services.AddCors(options =>
    {
        options.AddPolicy("AllowAll", policy =>
        {
            policy.WithOrigins("http://localhost:3000")
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials();
        });
    });

    builder.Services.AddSerilog((services, lc) => lc
        .ReadFrom.Configuration(builder.Configuration)
        .ReadFrom.Services(services));

    builder.Services.AddMazadZoneServices(builder.Configuration);

    builder.Services.AddSignalR();

    builder.Services.AddOpenApi();

    var descriptor = builder.Services.FirstOrDefault(d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
    if (descriptor != null && descriptor.ImplementationFactory != null)
    {
        var originalFactory = descriptor.ImplementationFactory;
        builder.Services.AddScoped<DbContextOptions<AppDbContext>>(sp =>
        {
            var options = (DbContextOptions<AppDbContext>)originalFactory(sp);
            var builderWithOptions = new DbContextOptionsBuilder<AppDbContext>(options);
            builderWithOptions.ReplaceService<Microsoft.EntityFrameworkCore.Infrastructure.IModelCustomizer, SeedingModelCustomizer>();
            builderWithOptions.ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.RelationalEventId.PendingModelChangesWarning));
            return builderWithOptions.Options;
        });
        
        builder.Services.AddScoped<DbContextOptions>(sp => sp.GetRequiredService<DbContextOptions<AppDbContext>>());
    }

    var app = builder.Build();


    using (var scope = app.Services.CreateScope())
    {
        var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        
        Log.Information("UserId Fields:");
        foreach (var field in typeof(MazadZone.Domain.Users.ValueObjects.UserId).GetFields(System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Public))
        {
            Log.Information("- Field: {Name} ({Type})", field.Name, field.FieldType.Name);
        }

        // Log.Information("Deleting old database content (EnsureDeleted)...");
        // await dbContext.Database.EnsureDeletedAsync();
        
        Log.Information("Applying migrations (Migrate)...");
        await dbContext.Database.MigrateAsync();
        
        Log.Information("Running Database Seeder...");
        var seeder = scope.ServiceProvider.GetRequiredService<IDatabaseSeeder>();
        await seeder.SeedAsync();
        
        Log.Information("Verifying database integrity and mappings...");
        var userCount = await dbContext.Users.CountAsync();
        var bidderCount = await dbContext.Bidders.CountAsync();
        var sellerCount = await dbContext.Sellers.CountAsync();
        var auctionCount = await dbContext.Auctions.CountAsync();
        
        Log.Information("=== Database Verification Report ===");
        Log.Information("- Users count: {UserCount}", userCount);
        Log.Information("- Bidders count: {BidderCount}", bidderCount);
        Log.Information("- Sellers count: {SellerCount}", sellerCount);
        Log.Information("- Auctions count: {AuctionCount}", auctionCount);
        
        var biddersWithoutUser = await dbContext.Bidders
            .Where(b => !dbContext.Users.Any(u => u.Id == b.Id))
            .CountAsync();
            
        var sellersWithoutUser = await dbContext.Sellers
            .Where(s => !dbContext.Users.Any(u => u.Id == s.Id))
            .CountAsync();
            
        if (biddersWithoutUser > 0)
        {
            Log.Error("DATABASE INTEGRITY ERROR: Found {Count} Bidders with no matching User record!", biddersWithoutUser);
        }
        else
        {
            Log.Information("All Bidders successfully map to User records.");
        }
        
        if (sellersWithoutUser > 0)
        {
            Log.Error("DATABASE INTEGRITY ERROR: Found {Count} Sellers with no matching User record!", sellersWithoutUser);
        }
        else
        {
            Log.Information("All Sellers successfully map to User records.");
        }
        Log.Information("====================================");
    }


    // Middlewares Configuration


    // Https Redirection
    app.UseHttpsRedirection();

    // Correlation ID Configuration
    app.UseMiddleware<CorrelationIdMiddleware>();

    // Serilog Request Logging Configuration
    app.UseSerilogRequestLogging(options =>
    {
        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value);
            diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent.ToString());
        };

        options.GetLevel = (httpContext, elapsed, ex) =>
        {
            if (httpContext.Request.Path.StartsWithSegments("/health"))
                return Serilog.Events.LogEventLevel.Verbose;

            return elapsed > 500
                ? Serilog.Events.LogEventLevel.Warning
                : Serilog.Events.LogEventLevel.Information;
        };
    });

    // CORS Configuration
    app.UseCors("AllowAll");

    // Custom Interceptor Middleware for GET /api/v1/auctions?SellerId=...
    app.Use(async (context, next) =>
    {
        if (context.Request.Path.Value != null &&
            context.Request.Path.Value.EndsWith("/api/v1/auctions", StringComparison.OrdinalIgnoreCase) &&
            context.Request.Method == "GET" &&
            context.Request.Query.ContainsKey("SellerId"))
        {
            var sellerIdStr = context.Request.Query["SellerId"].ToString();
            if (Guid.TryParse(sellerIdStr, out var sellerGuid))
            {
                var dbContext = context.RequestServices.GetRequiredService<AppDbContext>();
                
                int pageNumber = 1;
                if (context.Request.Query.TryGetValue("PageNumber", out var pageNumVal) && int.TryParse(pageNumVal, out var pn))
                {
                    pageNumber = pn > 0 ? pn : 1;
                }
                int pageSize = 6;
                if (context.Request.Query.TryGetValue("PageSize", out var pageSizeVal) && int.TryParse(pageSizeVal, out var ps))
                {
                    pageSize = ps > 0 ? ps : 6;
                }
                
                var sellerIdObj = MazadZone.Domain.Users.ValueObjects.UserId.From(sellerGuid);
                
                var query = dbContext.Auctions
                    .Include(a => a.Item)
                    .ThenInclude(i => i.Images)
                    .AsNoTracking()
                    .Where(a => a.SellerId == sellerIdObj);
                    
                var totalCount = await query.CountAsync();
                
                var rawItems = await query
                    .OrderByDescending(a => a.CreatedOnUtc)
                    .Skip((pageNumber - 1) * pageSize)
                    .Take(pageSize)
                    .Select(a => new
                    {
                        Id = a.Id.Value,
                        ImageUrl = a.Item.Images.Where(img => img.IsMain).Select(img => img.Path).FirstOrDefault() ?? string.Empty,
                        Title = a.Item.Title,
                        ItemStatus = a.Item.Status,
                        Condition = a.Item.Condition,
                        CurrentBidAmount = a.Bids
                            .Where(b => b.Status == MazadZone.Domain.Auctions.Enums.BidStatus.Leading)
                            .Select(b => (decimal?)b.Amount.Amount)
                            .FirstOrDefault() ?? a.StartBidAmount.Amount,
                        StartTime = a.StartTime,
                        EndTime = a.EndTime,
                        Status = a.Status,
                        BidsCount = a.Bids.Count()
                    })
                    .ToListAsync();
                    
                var items = rawItems.Select(a => new
                {
                    id = a.Id,
                    imageUrl = a.ImageUrl,
                    itemTitle = a.Title,
                    title = a.Title,
                    itemStatus = a.ItemStatus.ToString(),
                    condtion = a.Condition.ToString(),
                    currentBidAmount = a.CurrentBidAmount,
                    startTime = a.StartTime.ToString("o"),
                    endTime = a.EndTime.ToString("o"),
                    status = a.Status.ToString(),
                    bidsCount = a.BidsCount
                }).ToList();
                
                var responseObj = new
                {
                    pageNumber = pageNumber,
                    pageSize = pageSize,
                    totalPages = pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0,
                    totalCount = totalCount,
                    items = items,
                    hasPreviousPage = pageNumber > 1,
                    hasNextPage = pageNumber < (pageSize > 0 ? (int)Math.Ceiling(totalCount / (double)pageSize) : 0)
                };
                
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = 200;
                await System.Text.Json.JsonSerializer.SerializeAsync(context.Response.Body, responseObj);
                return;
            }
        }
        await next(context);
    });

    // Auth Configuration
    app.UseAuthentication();
    app.UseAuthorization();

    // Scalar Dashboard
    app.MapScalarApiReference();

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
    }


    // EndPoints and Hubs registration

    app.MapEmailEndpoints();
    app.MapDashboardEndpoints();
    app.MapNotificationEndpoints();
    app.MapBidderEndpoints();
    app.MapOrderEndpoints();
    app.MapPaymentEndpoints();
    app.MapCategoryEndpoints();
    app.MapUserEndpoints();
    app.MapSellerEndpoints();
    app.MapSellerDashboardEndpoints();
    app.MapAuctionEndpoints();
    app.MapDisputeEndpoints();
    app.MapDisputeTypeEndpoints();
    app.MapAuthenticationEndpoints();
    app.MapChatAgentEndpoints();


    app.MapHub<AuctionsHub>("/hubs/auctions");
    app.MapHub<NotificationsHub>("/hubs/notifications");
    app.MapHub<OrdersHub>("/hubs/orders");


    app.UseHangfireDashboard("/hangfire", new DashboardOptions
{
    Authorization = new[] { new AllowAllConnectionsFilter() }
});

    // Custom endpoint mapping to support public bidder profile details by ID
    app.MapGet("api/v1/bidders/{id:guid}", async (Guid id, MediatR.ISender sender, CancellationToken ct) => {
        var result = await sender.Send(new MazadZone.Application.Features.Bidders.Queries.GetBidderProfile.GetBidderProfileQuery(MazadZone.Domain.Users.ValueObjects.UserId.From(id)), ct);
        return result.Match(
            onValue: bidderDto => Results.Ok(bidderDto),
            onError: errors => errors.ToProblem());
    });

    app.Run();
}
catch (Exception ex)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    Log.CloseAndFlush();
}

#region Custom Seeding Model Customizer for Vogen Value Objects
public class VogenGuidComparer<T> : Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<T> where T : struct
{
    public VogenGuidComparer() : base(
        (id1, id2) => GetGuidValue(id1) == GetGuidValue(id2),
        id => GetGuidValue(id).GetHashCode(),
        id => id)
    {
    }

    private static Guid GetGuidValue(T id)
    {
        var type = typeof(T);
        var field = type.GetField("_value", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic)
                 ?? type.GetField("value", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.NonPublic);
        if (field != null)
        {
            return (Guid)field.GetValue(id)!;
        }

        var prop = type.GetProperty("Value", System.Reflection.BindingFlags.Instance | System.Reflection.BindingFlags.Public);
        if (prop != null)
        {
            try
            {
                return (Guid)prop.GetValue(id)!;
            }
            catch
            {
                // Ignore
            }
        }
        return Guid.Empty;
    }
}

public class SeedingModelCustomizer : Microsoft.EntityFrameworkCore.Infrastructure.ModelCustomizer
{
    public SeedingModelCustomizer(Microsoft.EntityFrameworkCore.Infrastructure.ModelCustomizerDependencies dependencies)
        : base(dependencies)
    {
    }

    public override void Customize(ModelBuilder modelBuilder, DbContext context)
    {
        Console.WriteLine("[Customizer] Running default Customize first...");
        base.Customize(modelBuilder, context);

        Console.WriteLine("[Customizer] Scanning model properties to set custom comparers...");
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            foreach (var property in entityType.GetProperties())
            {
                var type = property.ClrType;
                if (type.IsValueType && !type.IsPrimitive && !type.IsEnum)
                {
                    var valueProp = type.GetProperty("Value");
                    if (valueProp != null && valueProp.PropertyType == typeof(Guid))
                    {
                        Console.WriteLine($"[Customizer] MATCHED & SET: {entityType.Name}.{property.Name} ({type.Name})");
                        var comparerType = typeof(VogenGuidComparer<>).MakeGenericType(type);
                        var comparer = Activator.CreateInstance(comparerType) as Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer;
                        if (comparer != null)
                        {
                            property.SetValueComparer(comparer);
                        }
                    }
                }
            }
        }
    }
}
#endregion