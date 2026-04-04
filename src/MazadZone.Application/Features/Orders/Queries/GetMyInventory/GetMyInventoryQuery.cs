using System;
using MediatR;
using CSharpFunctionalExtensions;
using MazadZone.Application.Orders.Queries.DTOs;

namespace MazadZone.Application.Orders.Queries.GetMyInventory;

public record GetMyInventoryQuery(Guid UserId, int Page, int PageSize) : IRequest<Result<MyInventoryDto>>;