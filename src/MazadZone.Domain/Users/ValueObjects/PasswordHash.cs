namespace MazadZone.Domain.Users;


public sealed record PasswordHash
{
    public string Value { get; init; }

    private PasswordHash(string value) => Value = value;

    public static Result<PasswordHash> Create(string hash)
    {
        // We only validate that the hash exists. 
        // We DO NOT validate password complexity (length, symbols) here.
        // Complexity validation belongs in the Application/Identity layer on the plain-text password BEFORE it gets hashed.
        if (string.IsNullOrWhiteSpace(hash))
            return Result.Failure<PasswordHash>(Error.Validation("PasswordHash.Empty", "The password hash cannot be empty."));

        return Result.Success(new PasswordHash(hash));
    }

    // Explicitly overriding ToString() to prevent accidental logging of the hash!
    public override string ToString() => "***"; 
}