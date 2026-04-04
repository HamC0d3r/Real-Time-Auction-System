using System;
using MediatR;
using CSharpFunctionalExtensions;

namespace MazadZone.Application.Orders.DeliverOrder;

public record DeliverOrderCommand(Guid OrderId) : IRequest<Result>;