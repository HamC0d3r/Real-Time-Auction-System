using MazadZone.Domain.Categories;

namespace MazadZone.Application.Features.Categories.Commands.Delete;

public record DeleteCategoryCommand(CategoryId CategoryId) : ICommand<Unit>;