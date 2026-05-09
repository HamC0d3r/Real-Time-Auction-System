using MazadZone.Domain.Categories;

namespace MazadZone.Application.Features.Categories.Commands.Create;

public record CreateCategoryCommand(string Name, string Description, CategoryId? ParentCategoryId) : ICommand<Guid>;