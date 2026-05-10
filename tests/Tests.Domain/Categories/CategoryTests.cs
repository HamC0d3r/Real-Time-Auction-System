using Shouldly;
using MazadZone.Domain.Categories;
using MazadZone.Domain.Shared.ValueObjects;

namespace Tests.Domain.Categories;

public class CategoryTests
{
    private const string ValidName = "Electronics";
    private const string ValidDescription = "All electronic gadgets and devices";

    #region Creation Tests

    [Fact]
    public void Create_WithValidData_ShouldReturnSuccess()
    {
        // Act
        var result = Category.Create(ValidName, ValidDescription);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        result.Value.ShouldNotBeNull();
        result.Value.Name.Value.ShouldBe(ValidName);
        result.Value.Description.Value.ShouldBe(ValidDescription);
        result.Value.IsRootCategory.ShouldBeTrue();
    }

    [Fact]
    public void Create_WithParentId_ShouldNotBeRootCategory()
    {
        // Arrange
        var parentId = CategoryId.New();

        // Act
        var result = Category.Create(ValidName, ValidDescription, parentId);

        // Assert
        result.Value.ParentCategoryId.ShouldBe(parentId);
        result.Value.IsRootCategory.ShouldBeFalse();
    }

    #endregion

    #region Hierarchy & Movement Tests

    [Fact]
    public void MoveToParent_WithSelfId_ShouldReturnFailure()
    {
        // Arrange
        var category = Category.Create(ValidName, ValidDescription).Value;

        // Act
        var result = category.MoveToParent(category.Id);

        // Assert
        result.IsFailure.ShouldBeTrue();
        // result.Error.ShouldBe(CategoryErrors.SelfReference); // Uncomment if CategoryErrors is accessible
    }

    [Fact]
    public void MakeRootCategory_WhenHasParent_ShouldClearParentId()
    {
        // Arrange
        var parentId = CategoryId.New();
        var category = Category.Create(ValidName, ValidDescription, parentId).Value;

        // Act
        category.MakeRootCategory();

        // Assert
        category.ParentCategoryId.ShouldBeNull();
        category.IsRootCategory.ShouldBeTrue();
    }

    #endregion

    #region Sub-Category Management

    [Fact]
    public void AddSubCategory_WithCorrectParentId_ShouldReturnSuccess()
    {
        // Arrange
        var parent = Category.Create("Computers", "Laptops and Desktops").Value;
        var subCategory = Category.Create("Laptops", "Portable computers", parent.Id).Value;

        // Act
        var result = parent.AddSubCategory(subCategory);

        // Assert
        result.IsSuccess.ShouldBeTrue();
        parent.SubCategories.ShouldContain(subCategory);
    }

    [Fact]
    public void AddSubCategory_WithWrongParentId_ShouldReturnFailure()
    {
        // Arrange
        var parent = Category.Create("Computers", "Laptops and Desktops").Value;
        var unrelatedCategory = Category.Create("Cars", "Automobiles", CategoryId.New()).Value;

        // Act
        var result = parent.AddSubCategory(unrelatedCategory);

        // Assert
        result.IsFailure.ShouldBeTrue();
        parent.SubCategories.ShouldBeEmpty();
    }

    [Fact]
    public void AddSubCategory_WhenAlreadyAdded_ShouldReturnAlreadyExistsError()
    {
        // Arrange
        var parent = Category.Create("Computers", "Laptops and Desktops").Value;
        var subCategory = Category.Create("Laptops", "Portable computers", parent.Id).Value;
        parent.AddSubCategory(subCategory);

        // Act
        var result = parent.AddSubCategory(subCategory);

        // Assert
        result.IsFailure.ShouldBeTrue();
    }

    #endregion

    #region Soft Delete Tests

    [Fact]
    public void Delete_WhenActive_ShouldSetIsDeletedAndDate()
    {
        // Arrange
        var category = Category.Create(ValidName, ValidDescription).Value;

        // Act
        var result = category.Delete();

        // Assert
        result.IsSuccess.ShouldBeTrue();
        category.IsDeleted.ShouldBeTrue();
        category.DeletedOnUtc.ShouldNotBeNull();
    }

    [Fact]
    public void Delete_ShouldCascadeToSubCategories()
    {
        // Arrange
        var parent = Category.Create("Parent", "Desc").Value;
        var sub = Category.Create("Sub", "Desc", parent.Id).Value;
        parent.AddSubCategory(sub);

        // Act
        parent.Delete();

        // Assert
        parent.IsDeleted.ShouldBeTrue();
        sub.IsDeleted.ShouldBeTrue();
    }

    [Fact]
    public void Restore_WhenDeleted_ShouldResetFlags()
    {
        // Arrange
        var category = Category.Create(ValidName, ValidDescription).Value;
        category.Delete();

        // Act
        var result = category.Restore();

        // Assert
        result.IsSuccess.ShouldBeTrue();
        category.IsDeleted.ShouldBeFalse();
        category.DeletedOnUtc.ShouldBeNull();
    }

    #endregion

    #region Update Tests

    [Fact]
    public void Update_WithNewValues_ShouldUpdateProperties()
    {
        // Arrange
        var category = Category.Create(ValidName, ValidDescription).Value;
        var newName = Name.Create("New Name").Value;
        var newDesc = Description.Create("New Description").Value;

        // Act
        category.Update(newName, newDesc);

        // Assert
        category.Name.ShouldBe(newName);
        category.Description.ShouldBe(newDesc);
    }

    #endregion
}