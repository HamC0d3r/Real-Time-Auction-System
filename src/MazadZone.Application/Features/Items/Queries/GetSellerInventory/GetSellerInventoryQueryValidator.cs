namespace MazadZone.Application.Features.Items.Queries.GetSellerInventory;


public sealed class GetSellerInventoryQueryValidator : AbstractValidator<GetSellerInventoryQuery>
{
    public GetSellerInventoryQueryValidator()
    {
        RuleFor(x => x.SellerId)
            .NotEmpty()
            .WithMessage("The Seller ID must be provided to retrieve inventory.");
            
        // If you had pagination (Page, PageSize), you would validate those here too!
        // RuleFor(x => x.PageSize).GreaterThan(0).LessThanOrEqualTo(100);
    }
}