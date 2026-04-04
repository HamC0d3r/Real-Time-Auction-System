using System;
using MediatR;
using CSharpFunctionalExtensions;

namespace MazadZone.Application.Orders.OpenDispute;

public record OpenDisputeCommand(Guid OrderId, string Reason) : IRequest<Result>;