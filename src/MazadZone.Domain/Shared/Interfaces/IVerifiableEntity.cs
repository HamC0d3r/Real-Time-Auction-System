namespace MazadZone.Domain.Common;

/// <summary>
/// Defines common identity and verification properties for actors within the system.
/// </summary>
public interface IVerifiableEntity
{
    bool IsVerified { get; }
    string NationalId { get; }
}