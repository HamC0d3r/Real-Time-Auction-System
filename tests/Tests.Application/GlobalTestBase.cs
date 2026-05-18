using MazadZone.Application.Common.Interfaces;
using MazadZone.Application.Services;
using MazadZone.Domain.Repositories;
using MediatR;
using NSubstitute.AutoSub;

public abstract class GlobalTestBase
{
    // The engine that creates all fakes automatically
    protected readonly AutoSubstitute AutoMocker = new();
    
    // Global dependency used across the whole app
    protected readonly IUnitOfWork _unitOfWork;
    protected readonly INotificationRepository _notificationRepository;
    protected readonly IEmailService _emailService;
    protected readonly ISellerRepository _sellerRepository;
    protected readonly IAuctionRepository _auctionRepository;
    protected readonly IAuctionQueries _auctionQueries;

    protected readonly ISender _sender;


    protected GlobalTestBase()
    {
        _unitOfWork = AutoMocker.GetSubstituteFor<IUnitOfWork>();
        _notificationRepository = AutoMocker.GetSubstituteFor<INotificationRepository>();
        _sellerRepository = AutoMocker.GetSubstituteFor<ISellerRepository>();
        _auctionRepository = AutoMocker.GetSubstituteFor<IAuctionRepository>();
        _auctionQueries = AutoMocker.GetSubstituteFor<IAuctionQueries>();
        _emailService = AutoMocker.GetSubstituteFor<IEmailService>();
        _sender = AutoMocker.GetSubstituteFor<ISender>();

    }

    // Helper to grab a mock if you need it on the fly
    protected T Dependency<T>() where T : class => AutoMocker.GetSubstituteFor<T>();
}