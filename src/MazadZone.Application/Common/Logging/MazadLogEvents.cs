
public static partial class MazadLogEvents
{
    public static class Global
    {
        public const int NotFound = 100;
        public const int ResourceReadSuccess = 9002;
        public const int ResourceDeleted = 9003;
        public const int ResourceCreated = 9004;
        public const int ResourceUpdated = 9005;
    }

    public static class System
    {

    }

    public static class Users
    {
        // Activate User: 4010 - 4019
        public const int ActivateDomainViolation = 4011;
        public const int ActivateSuccess = 4012;

        // Ban User: 4020 - 4029
        public const int BanDomainViolation = 4021;
        public const int BanSuccess = 4022;

        //1150 - 1199: Ban Side Effects (Event Handlers)
        public const int BanAuctionsCancelled = 1150;
        public const int BanBidsRemoved = 1151;
        public const int BanCacheInvalidated = 1152;
        public const int BanNotificationSent = 1153;


        // Change Email: 4030 - 4039
        public const int ChangeEmailConflict = 4031;
        public const int ChangeEmailSuccess = 4032;

        // Change Password: 4040 - 4049
        public const int ChangePasswordHashingError = 4041;
        public const int ChangePasswordSuccess = 4042;

        // Suspend User: 4050 - 4059
        public const int SuspendDomainViolation = 4051;
        public const int SuspendSuccess = 4052;

        //1250 - 1299: Suspend Side Effects (Event Handlers)
        public const int SuspensionCacheInvalidated = 1250;
        public const int SuspensionNotificationSent = 1251;
        public const int SuspensionAuctionsCancelled = 1252;
        public const int SuspensionBidsRemoved = 1253;
    }

    public static class Sellers
    {
        public const int NotFound = 150;
        public const int VerifyDomainViolation = 151;
        public const int VerifySuccess = 152;
        public const int BankUpdateDomainViolation = 153;
        public const int BankUpdateSuccess = 154;
        public const int BecomeSellerDomainViolation = 155;
        public const int BecomeSellerSuccess = 156;

    }

    public static class Bidders
    {
        public const int NotFound = 1001;
        public const int Registered = 1002;
        public const int ProfileError = 1003;
        public const int BidderRetrieved = 1002;
        public const int BidderProfileUpdated = 1003;

    }

    public static class Authentication
    {
        // Refresh Token Events
        public const int InvalidRefreshTokenProvided = 2001;
        public const int TokenRotationRejected = 2002;
        public const int TokenRefreshedSuccess = 2003;

        // Login Events (For when you build the Login Handler)
        public const int LoginSuccess = 2010;
        public const int InvalidCredentials = 2011;
        public const int AccountLockedOut = 2012;

        // General Auth
        public const int SessionInvalidated = 2020;

        public const int LogoutSuccess = 2021;
        public const int LogoutFromAllDevices = 2022;
        public const int LogoutSessionNotFound = 2023;




    }

    public static class Orders
    {
        public const int AddFeedbackAttempt = 3001;
        public const int AddFeedbackDomainViolation = 3002;
        public const int AddFeedbackSuccess = 3003;

        public const int CancelAttempt = 3010;
        public const int CancelDomainViolation = 3011;
        public const int CancelSuccess = 3012;

        // ConfirmOrder: 3020 - 3029
        public const int ConfirmAttempt = 3020;
        public const int ConfirmDomainViolation = 3021;
        public const int ConfirmSuccess = 3022;

        // CreateOrder: 3030 - 3039
        public const int CreateAttempt = 3030;
        public const int CreateDomainViolation = 3031;
        public const int CreateSuccess = 3032;

        // DeliverOrder: 3040 - 3049
        public const int DeliverAttempt = 3040;
        public const int DeliverDomainViolation = 3041;
        public const int DeliverSuccess = 3042;

        // OpenDispute: 3050 - 3059
        public const int OpenDisputeAttempt = 3050;
        public const int OpenDisputeDomainViolation = 3051;
        public const int OpenDisputeSuccess = 3052;

        // ResolveDispute: 3060 - 3069
        public const int ResolveDisputeAttempt = 3060;
        public const int ResolveDisputeDomainViolation = 3061;
        public const int ResolveDisputeSuccess = 3062;

        // ShipOrder: 3070 - 3079
        public const int ShipAttempt = 3070;
        public const int ShipDomainViolation = 3071;
        public const int ShipSuccess = 3072;

        // GetGlobalStats: 3080
        public const int CompileGlobalStats = 3080;

        // GetOrderByWinningBid: 3081 - 3082
        public const int ResolvingOrderByBid = 3081;
        public const int OrderNotFoundForBid = 3082;

        // GetOrderDetails: 3083
        public const int FetchingOrderDetails = 3083;

        // GetSellerStats: 3084
        public const int CalculatingSellerStats = 3084;

        // SearchOrders: 3085
        public const int SearchingOrders = 3085;

    }

    public static class Categories
    {
        // 5700 - 5749: Add SubCategory Operations
        public const int AddSubCategoryViolation = 5702;
        public const int AddSubCategorySuccess = 5703;
        public const int DuplicateName = 5302;

        // 5200 - 5249: Category Deletion (Destructive Ops)
        public const int DeleteViolation = 5201;
        public const int DeleteSuccess = 5202;

        // 5600 - 5649: Hierarchy Promotion / Root Operations
        public const int MakeRootViolation = 5601;
        public const int MakeRootSuccess = 5602;

        // 5100 - 5149: Hierarchy Relocation (MoveToParent)
        public const int MoveToParentViolation = 5101;
        public const int MoveToParentSuccess = 5102;

        // 5400 - 5449: Restoration Operations
        public const int RestoreViolation = 5401;
        public const int RestoreSuccess = 5402;

        public const int UpdateSuccess = 5502;

        public const int CreationViolation = 5300;
        public const int CreationSuccess = 5301;

        public const int GetByIdSuccess = 5831;
        
    }


}