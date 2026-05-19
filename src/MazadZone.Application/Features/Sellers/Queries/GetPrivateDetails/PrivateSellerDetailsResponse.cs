using MazadZone.Domain.Auctions;

namespace MazadZone.Application.Features.Sellers.Queries.GetPrivateDetails;
public record PrivateSellerDetailsResponse(
    SellerId SellerId,
    string BankAccountNumber,
    string? TaxIdentificationNumber,
    bool IsVerified,
    decimal Rating);