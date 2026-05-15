using MazadZone.Domain.Repositories;
using NSubstitute.AutoSub;

public abstract class GlobalTestBase
{
    // The engine that creates all fakes automatically
    protected readonly AutoSubstitute AutoMocker = new();
    
    // Global dependency used across the whole app
    protected readonly IUnitOfWork _unitOfWork;
    protected readonly INotificationRepository _notificationRepository;
    protected readonly ISellerRepository _sellerRepository;

    protected GlobalTestBase()
    {
        _unitOfWork = AutoMocker.GetSubstituteFor<IUnitOfWork>();
        _notificationRepository = AutoMocker.GetSubstituteFor<INotificationRepository>();
        _sellerRepository = AutoMocker.GetSubstituteFor<ISellerRepository>();

    }

    // Helper to grab a mock if you need it on the fly
    protected T Dependency<T>() where T : class => AutoMocker.GetSubstituteFor<T>();
}