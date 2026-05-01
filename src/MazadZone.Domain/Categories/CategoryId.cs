namespace MazadZone.Domain.Categories;

[ValueObject<Guid>(conversions: Conversions.SystemTextJson | Conversions.TypeConverter )]
public partial struct CategoryId
{
    public static CategoryId New() => From(Guid.CreateVersion7());
}


