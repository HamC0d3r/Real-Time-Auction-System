using MazadZone.Application.Common.Validators;

namespace MazadZone.Application.Features.Bidders.Commands.Register;

public class RegisterBidderValidator : AbstractValidator<RegisterBidderCommand>
{
    public RegisterBidderValidator()
    {
        RuleFor(x => x.Email).ValidateEmail();

        RuleFor(x => x.Password).ValidatePassword();

        RuleFor(x => x.PhoneNumber).ValidatePhoneNumber();

        RuleFor(x => x.FirstName).ValidateFirstName();
        RuleFor(x => x.LastName).ValidateLastName();
        RuleFor(x => x.SecondName).ValidateSecondName();
        RuleFor(x => x.ThirdName).ValidateThirdName();

        // --- Nested Validation ---
        // This tells FluentValidation to use the AddressDtoValidator logic for the Address property
        RuleFor(x => x.Address)
            .NotNull()
            .SetValidator(new AddressDtoValidator());
    }
}