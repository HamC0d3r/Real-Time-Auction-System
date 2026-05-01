using AuthService.Domain.Constants; 
using MazadZone.Domain.Users.Errors;

namespace MazadZone.Domain.ValueObjects;

public record FullName
{

    #pragma warning disable CS8618 
    #pragma warning disable CS0519
    private FullName() { } 
    #pragma warning restore CS8618


    private FullName(string first, string second, string third, string last)
    {
        FirstName = first;
        SecondName = second;
        ThirdName = third;
        LastName = last;
    }

    public string FirstName { get; init; }
    public string SecondName { get; init; } 
    public string ThirdName { get; init; }  
    public string LastName { get; init; }

    // Business Logic: Generate the display name dynamically
    public string GetDisplayName()
    {
        var parts = new[] { FirstName, SecondName, ThirdName, LastName };
        return string.Join(" ", parts.Where(p => !string.IsNullOrWhiteSpace(p)));
    }

    public static Result<FullName> Create(string first, string second, string third, string last)
    {
        // 1. Trim the inputs safely
        var fName = first?.Trim();
        var sName = second?.Trim();
        var tName = third?.Trim();
        var lName = last?.Trim();

        // 2. Validate Empty/Null (Implicitly converts Error to Result<FullName>)
        if (string.IsNullOrWhiteSpace(fName)) return FullNameErrors.FirstNameEmpty;
        if (string.IsNullOrWhiteSpace(sName)) return FullNameErrors.SecondNameEmpty;
        if (string.IsNullOrWhiteSpace(tName)) return FullNameErrors.ThirdNameEmpty;
        if (string.IsNullOrWhiteSpace(lName)) return FullNameErrors.LastNameEmpty;

        // 3. Validate Length (Implicitly converts Error to Result<FullName>)
        if (fName.Length > UserConstants.NameMaxLength) return FullNameErrors.FirstNameTooLong;
        if (sName.Length > UserConstants.NameMaxLength) return FullNameErrors.SecondNameTooLong;
        if (tName.Length > UserConstants.NameMaxLength) return FullNameErrors.ThirdNameTooLong;
        if (lName.Length > UserConstants.NameMaxLength) return FullNameErrors.LastNameTooLong;

        // 4. Success (Implicitly converts FullName to Result<FullName>)
        return new FullName(fName, sName, tName, lName);
    }
}