namespace MazadZone.Application.Common.Messaging;

public interface IQuery<TResponse> : IRequest<Result<TResponse>>
{
}