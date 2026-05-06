namespace MazadZone.Domain.Entities.Orders;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(OrderId id, CancellationToken cancellationToken = default);
    void Add(Order order, CancellationToken cancellationToken = default);
    void Update(Order order);
    void Delete(Order order);
}