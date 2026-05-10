using Microsoft.Extensions.Logging;
using MazadZone.Domain.Categories;
using MazadZone.Application.Features.Categories.Queries;

public abstract class CategoryBaseTest<THandler> : GlobalTestBase 
    where THandler : class
{
    protected readonly ICategoryRepository _categoryRepository;
    protected readonly ICategoryQueries _categoryQueries; 
    protected readonly ILogger<THandler> _logger;

    // The System Under Test (SUT)
    protected THandler Handler => AutoMocker.CreateInstance<THandler>();

    protected CategoryBaseTest()
    {
        // Category-specific dependencies
        _categoryRepository = AutoMocker.GetSubstituteFor<ICategoryRepository>();
        _categoryQueries = AutoMocker.GetSubstituteFor<ICategoryQueries>();
        _logger = AutoMocker.GetSubstituteFor<ILogger<THandler>>();
    }
}