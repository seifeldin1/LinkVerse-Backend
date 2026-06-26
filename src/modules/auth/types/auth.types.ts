export interface RegisterDTO{
    username: string;
    email: string;
    password: string;
}

export interface LoginDTO{
    identifier: string; 
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
}