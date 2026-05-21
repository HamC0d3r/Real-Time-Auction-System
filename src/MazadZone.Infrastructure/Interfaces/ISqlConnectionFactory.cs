// Location: MazadZone.Application.Common.Interfaces
using System.Data;

namespace MazadZone.Application.Common.Interfaces;

public interface ISqlConnectionFactory 
{
    IDbConnection CreateConnection();
}