using MazadZone.Domain.Auctions;
using MazadZone.Domain.Categories;
using MazadZone.Domain.Users.ValueObjects;

namespace MazadZone.Application.Common.Validation;

public static class GlobalValidationExtensions
{
    public static IRuleBuilderOptions<T, BidderId> MustBeValidBidderId<T>(this IRuleBuilder<T, BidderId> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage("Bidder ID is required and cannot be empty.");
    }

    public static IRuleBuilderOptions<T, SellerId> MustBeValidSellerId<T>(this IRuleBuilder<T, SellerId> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage("Seller identifier is required.");
    }


    public static IRuleBuilderOptions<T, UserId> MustBeValidUserId<T>(this IRuleBuilder<T, UserId> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage("User identifier is required.");
    }

    public static IRuleBuilderOptions<T, BidId> MustBeValidBidId<T>(this IRuleBuilder<T, BidId> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage("Bid ID is required and cannot be empty.");
    }

    // Extension for OrderId
    public static IRuleBuilderOptions<T, OrderId> MustBeValidOrderId<T>(this IRuleBuilder<T, OrderId> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage("Order ID is required and cannot be empty.");
    }

    public static IRuleBuilderOptions<T, CategoryId> MustBeValidCategoryId<T>(this IRuleBuilder<T, CategoryId> ruleBuilder, string nameOfCategory = "Category Id")
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage($"{nameOfCategory}  is required and cannot be empty.")
            .Must(id => id.Value != Guid.Empty)
            .WithMessage("Invalid {PropertyName}."); // This will use the property name in the error message    
    }
}