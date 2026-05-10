using FluentValidation.TestHelper;
using MazadZone.Application.Features.Categories.Commands.Create;

namespace Tests.Application.Features.Categories.Create;

public class CreateCategoryValidatorTests
{
    private readonly CreateCategoryCommandValidator _validator = new();

    [Theory]
    [InlineData("")]
    [InlineData("a")] // Assuming min length is higher
    public void Name_Should_Have_Error_When_Invalid(string invalidName)
    {
        var command = new CreateCategoryCommand(invalidName, "Description", null);
        var result = _validator.TestValidate(command);
        result.ShouldHaveValidationErrorFor(x => x.Name);
    }

    [Fact]
    public void Should_Not_Have_Errors_When_Command_Is_Valid()
    {
        var command = new CreateCategoryCommand("Electronics", "Valid Description", null);
        var result = _validator.TestValidate(command);
        result.ShouldNotHaveAnyValidationErrors();
    }
}