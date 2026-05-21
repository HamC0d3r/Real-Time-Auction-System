using MazadZone.Infrastructure.Common.Constants;
using MazadZone.Infrastructure.Outbox;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace MazadZone.Infrastructure.Persistence.Configurations;
public sealed class OutboxMessageConfiguration : IEntityTypeConfiguration<OutboxMessage>
{
    public void Configure(EntityTypeBuilder<OutboxMessage> builder)
    {
        builder.ToTable(TableNames.OutboxMessages);
        builder.HasKey(m => m.Id);
        
        // Good idea to index this since the background worker will query it constantly
        builder.HasIndex(m => m.ProcessedOnUtc); 
    }
}