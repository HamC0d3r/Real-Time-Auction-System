using MazadZone.Domain.Disputes;
using MazadZone.Domain.Repositories;

namespace MazadZone.Application.Features.Disputes.Commands.OpenDispute;

public class OpenDisputeCommandHandler : ICommandHandler<OpenDisputeCommand, Guid>
{
    private readonly IDisputeRepository _disputeRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<OpenDisputeCommandHandler> _logger;

    public OpenDisputeCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<OpenDisputeCommandHandler> logger,
        IDisputeRepository disputeRepository
        )
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
        _disputeRepository = disputeRepository;
    }

    public async Task<Result<Guid>> Handle(OpenDisputeCommand request, CancellationToken ct)
    {
        // OpenDisputeLogs.LogAttempt(_logger, request.OrderId, request.Reason);

        if(await _disputeRepository.OrderHasOpenDisputeAsync(request.OrderId, ct))
        {
            return DisputeErrors.OrderHasOpenDispute;  
        }

                var titleResult = Title.Create(request.Title);
        if (titleResult.IsFailure) return titleResult.TopError;

        var descriptionResult = Description.Create(request.Description);
        if (descriptionResult.IsFailure) return descriptionResult.TopError;

        var images = new List<Image>(); 

if (request.Images is not null && request.Images.Any())
{
    foreach(var imageDto in request.Images)
    {
        var image = Image.Create(imageDto.Path, imageDto.AltText, imageDto.isMain);
        if(image.IsFailure) return image.TopError;
        
        images.Add(image.Value); // ✅ Now this works perfectly
    }
}


        var dispute = Dispute.Open(request.OrderId, request.DisputeTypeId, titleResult.Value, descriptionResult.Value, images);


        _disputeRepository.Add(dispute);
        await _unitOfWork.SaveChangesAsync(ct);

        OpenDisputeLogs.LogSuccess(_logger, request.OrderId);

        return dispute.Id.Value;
    }

}