using MazadZone.Application.Common.Validators;

namespace MazadZone.Application.Features.Bidders.Commands.Register;

public class RegisterBidderValidator : AbstractValidator<RegisterBidderCommand>
{
    public RegisterBidderValidator()
    {
        RuleFor(x => x.Email).MustBeValidEmail();

        RuleFor(x => x.Password).MustBeValidPassword();

        RuleFor(x => x.PhoneNumber).MustBeValiePhoneNumber();

        RuleFor(x => x.FirstName).MustBeValidName("First Name");
        RuleFor(x => x.LastName).MustBeValidName("Last Name");
        RuleFor(x => x.SecondName).MustBeValidName("Second Name");
        RuleFor(x => x.ThirdName).MustBeValidName("Third Name");

        RuleFor(x => x.Address)
            .NotNull()
            .SetValidator(new AddressDtoValidator());

        RuleFor(x => x.IdentityCardImageBytes)
            .NotNull()
            .Must(bytes => bytes.Length > 0)
            .WithMessage("An image file of the identity card is required.")
            .Must(bytes => bytes.Length <= 5 * 1024 * 1024)
            .WithMessage("File size must not exceed 5MB.");
    }
}