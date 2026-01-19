export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  permissions: string[];
}

export interface IAuthService {
  generateTokens(userId: string, email: string, permissions: string[]): Promise<TokenPair>;
  validateAccessToken(token: string): Promise<JwtPayload>;
  validateRefreshToken(token: string): Promise<JwtPayload>;
  revokeRefreshToken(token: string): Promise<void>;
  hashPassword(password: string): Promise<string>;
  comparePassword(password: string, hash: string): Promise<boolean>;
}

