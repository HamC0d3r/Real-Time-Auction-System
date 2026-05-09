using MazadZone.Domain.Categories;

namespace MazadZone.Application.Features.Categories.Commands.MoveToParent;

public record MoveToParentCommand(CategoryId CategoryId, CategoryId? NewParentId) : ICommand<Unit>;