using MazadZone.Domain.Orders;

namespace MazadZone.Application.Common.Extensions;

public static class DisputeValidationExtensions
{
    public static IRuleBuilderOptions<T, string> ValidateDisputeReason<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage("A reason for the dispute must be provided.")
            .MinimumLength(DisputeConsts.MinReasonLength)
            .WithMessage($"The dispute reason must be at least {DisputeConsts.MinReasonLength} characters long to provide sufficient detail.")
            .MaximumLength(DisputeConsts.MaxReasonLength)
            .WithMessage($"The dispute reason cannot exceed {DisputeConsts.MaxReasonLength} characters.");
    }

public static IRuleBuilderOptions<T, string> ValidateResolution<T>(this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .NotEmpty()
            .WithMessage("A resolution must be provided.")
            .MinimumLength(DisputeConsts.MinResolutionLength)
            .WithMessage($"The resolution details must be at least {DisputeConsts.MinResolutionLength} characters long.")
            .MaximumLength(DisputeConsts.MaxResolutionLength)
            .WithMessage($"The resolution cannot exceed {DisputeConsts.MaxResolutionLength} characters.");
    }
}