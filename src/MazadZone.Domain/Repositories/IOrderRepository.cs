using MazadZone.Domain.Shared.Interfaces;

namespace MazadZone.Domain.Repositories;

public interface IOrderRepository : IGenericRepository<Order> , IScopedService
{
}