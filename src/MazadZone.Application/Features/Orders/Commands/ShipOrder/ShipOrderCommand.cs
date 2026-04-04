using System;
using MediatR;
using CSharpFunctionalExtensions;

namespace MazadZone.Application.Orders.ShipOrder;

public record ShipOrderCommand(Guid OrderId) : IRequest<Result>;