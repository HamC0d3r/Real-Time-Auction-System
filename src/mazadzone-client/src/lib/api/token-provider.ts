export interface TokenProvider {
  getAccessToken(): string | null;
  getRefreshToken(): string | null;
  refreshAccessToken(): Promise<string>;
  onTokenRefreshed(callback: (token: string) => void): () => void;
  onLogout(redirect: () => void): void;
}