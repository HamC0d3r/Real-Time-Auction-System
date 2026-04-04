using System;
using MediatR;
using CSharpFunctionalExtensions;

namespace MazadZone.Application.Orders.ResolveDispute;

public record ResolveDisputeCommand(Guid OrderId, string Resolution) : IRequest<Result>;