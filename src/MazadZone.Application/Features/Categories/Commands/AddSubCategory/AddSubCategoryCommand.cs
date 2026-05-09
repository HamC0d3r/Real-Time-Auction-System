using MazadZone.Domain.Categories;

namespace MazadZone.Application.Features.Categories.Commands.AddSubCategory;

public record AddSubCategoryCommand(CategoryId ParentId, CategoryId SubCategoryId) : ICommand<Unit>;