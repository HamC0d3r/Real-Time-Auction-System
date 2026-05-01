using MazadZone.Domain.Orders;

namespace MazadZone.Application.Common.Extensions;

public static class OrderValidationExtensions
{
    public static IRuleBuilderOptions<T, OrderId> ValidateOrderId<T>(this IRuleBuilder<T, OrderId> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage("Order ID is required.")
            .Must(id => id.Value != Guid.Empty)
            .WithMessage("Order ID must be a valid unique identifier.");
    }


}