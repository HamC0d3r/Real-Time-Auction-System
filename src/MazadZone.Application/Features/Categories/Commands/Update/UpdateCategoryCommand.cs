using MazadZone.Domain.Categories;

namespace MazadZone.Application.Features.Categories.Commands.Update;

public record UpdateCategoryCommand(CategoryId CategoryId, string Name, string Description) : ICommand<Unit>;