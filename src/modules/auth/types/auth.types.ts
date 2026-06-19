export interface RegisterDTO{
    username: string;
    email: string;
    password: string;
}

export interface LoginDTO{
    identifier: string; // can be either email or username
    password: string;
}

export interface AuthTokens{
    accessToken: string;
    refreshToken: string;
}

export interface RefreshTokenDTO{
    refreshToken: string;
}   

export interface Payload{
    userId: string;
    username: string;
    iat?: number; // issued at
    exp?: number; // expiration time
}