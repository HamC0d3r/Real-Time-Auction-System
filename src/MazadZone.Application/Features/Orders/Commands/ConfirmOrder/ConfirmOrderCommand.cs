using System;
using MediatR;
using CSharpFunctionalExtensions;

namespace MazadZone.Application.Orders.ConfirmOrder;

public record ConfirmOrderCommand(Guid OrderId) : IRequest<Result>;