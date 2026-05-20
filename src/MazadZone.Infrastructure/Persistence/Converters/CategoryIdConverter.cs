using MazadZone.Domain.Categories;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace MazadZone.Infrastructure.Persistence.Converters;

class CategoryIdConverter : ValueConverter<CategoryId, Guid>
{
    public CategoryIdConverter() 
        : base(id => id.Value, guid =>  CategoryId.From(guid)) { }
}