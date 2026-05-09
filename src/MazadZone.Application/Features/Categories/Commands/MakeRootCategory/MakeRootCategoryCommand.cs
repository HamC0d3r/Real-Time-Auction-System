using MazadZone.Domain.Categories;

namespace MazadZone.Application.Features.Categories.Commands.MakeRootCategory;

public record MakeRootCategoryCommand(CategoryId CategoryId) : ICommand<Unit>;