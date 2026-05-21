using Microsoft.AspNetCore.OpenApi;
using Microsoft.OpenApi.Models;

namespace MazadZone.Api.OpenApi.Transformers;

internal sealed class DefaultInfoTransformer : IOpenApiDocumentTransformer
{
    public Task TransformAsync(OpenApiDocument document, OpenApiDocumentTransformerContext context, CancellationToken cancellationToken)
    {
        document.Info.Title = "Mazad Zone API";
        document.Info.Version = "1.0"; // optional
        return Task.CompletedTask;
    }
}
