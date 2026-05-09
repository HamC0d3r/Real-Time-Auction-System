using MazadZone.Domain.Categories;

namespace MazadZone.Application.Features.Categories.Commands.Restore;

public record RestoreCategoryCommand(CategoryId CategoryId) : ICommand<Unit>;