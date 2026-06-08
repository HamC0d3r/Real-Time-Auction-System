using Hangfire.Dashboard;

namespace MazadZone.Api.Configuration // Adjust namespace as needed
{
    public class AllowAllConnectionsFilter : IDashboardAuthorizationFilter
    {
        public bool Authorize(DashboardContext context)
        {
            // WARNING: This allows anyone who can reach the URL to access the dashboard.
            // This is perfect for local Docker development.
            // For production, you would check the HttpContext here to ensure the user is an Admin.
            return true;
        }
    }
}