namespace MazadZone.Application.Common.Messaging;

public interface IIdempotentCommand : ICommand
{
    Guid Id { get; }
}


public interface IIdempotentCommand<TResponse> : ICommand<TResponse>
{
    Guid Id { get; }
}