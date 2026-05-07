import * as signalR from "@microsoft/signalr";
import { env } from "@/config/env";

/**
 * Generic SignalR hub connection factory.
 *
 * Creates a configured HubConnection with:
 * - Automatic reconnect with exponential backoff
 * - Access token injection from the auth store
 * - Logging level based on NODE_ENV
 *
 * @param hubPath - The hub path appended to the SignalR base URL (e.g. "/bidding")
 * @returns A configured (but not yet started) HubConnection
 */
export function createHubConnection(hubPath: string): signalR.HubConnection {
  const hubUrl = `${env.NEXT_PUBLIC_SIGNALR_HUB_URL}${hubPath}`;

  const connection = new signalR.HubConnectionBuilder()
    .withUrl(hubUrl, {
      accessTokenFactory: () => {
        // Dynamic import to avoid circular dependency
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { useAuthStore } = require("@/stores/auth.store") as {
          useAuthStore: { getState: () => { accessToken: string | null } };
        };
        return useAuthStore.getState().accessToken ?? "";
      },
    })
    .withAutomaticReconnect({
      /** Exponential backoff: 0s, 2s, 5s, 10s, 30s */
      nextRetryDelayInMilliseconds: (retryContext) => {
        const delays = [0, 2000, 5000, 10_000, 30_000];
        return delays[Math.min(retryContext.previousRetryCount, delays.length - 1)] ?? null;
      },
    })
    .configureLogging(
      process.env.NODE_ENV === "development"
        ? signalR.LogLevel.Information
        : signalR.LogLevel.Warning,
    )
    .build();

  return connection;
}

/**
 * Starts a hub connection with error handling.
 * Safe to call even if the connection is already started.
 */
export async function startConnection(
  connection: signalR.HubConnection,
): Promise<void> {
  if (connection.state === signalR.HubConnectionState.Disconnected) {
    try {
      await connection.start();
      console.log(`[SignalR] Connected to ${connection.baseUrl}`);
    } catch (err) {
      console.error("[SignalR] Connection failed:", err);
      // Retry after 5 seconds
      setTimeout(() => startConnection(connection), 5000);
    }
  }
}

/**
 * Stops a hub connection gracefully.
 */
export async function stopConnection(
  connection: signalR.HubConnection,
): Promise<void> {
  if (connection.state !== signalR.HubConnectionState.Disconnected) {
    try {
      await connection.stop();
      console.log(`[SignalR] Disconnected from ${connection.baseUrl}`);
    } catch (err) {
      console.error("[SignalR] Disconnect failed:", err);
    }
  }
}
