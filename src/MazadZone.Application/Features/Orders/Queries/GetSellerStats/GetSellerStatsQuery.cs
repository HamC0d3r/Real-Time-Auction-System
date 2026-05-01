using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;
using MazadZone.Application.Features.Orders.Queries.DTOs;
using MazadZone.Domain.Auctions;

namespace MazadZone.Application.Features.Orders.Queries.GetSellerStats;

public record GetSellerStatsQuery(SellerId SellerId) : IQuery<SellerOrderStatsDto>;
