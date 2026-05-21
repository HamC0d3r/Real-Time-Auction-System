# Base runtime image
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

# Build environment
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy csproj files and restore as distinct layers for caching
COPY ["MazadZone.Api/MazadZone.Api.csproj", "MazadZone.Api/"]
COPY ["MazadZone.Application/MazadZone.Application.csproj", "MazadZone.Application/"]
COPY ["MazadZone.Domain/MazadZone.Domain.csproj", "MazadZone.Domain/"]
COPY ["MazadZone.Infrastructure/MazadZone.Infrastructure.csproj", "MazadZone.Infrastructure/"]

RUN dotnet restore "MazadZone.Api/MazadZone.Api.csproj"

# Copy the rest of the code and build
COPY . .
WORKDIR "/src/MazadZone.Api"
RUN dotnet build "MazadZone.Api.csproj" -c Release -o /app/build

# Publish the application
FROM build AS publish
RUN dotnet publish "MazadZone.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage/image
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "MazadZone.Api.dll"]