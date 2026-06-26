import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';

import {User} from '../../../models/user.model';
import { AuthRepository } from '../repositories/auth.repository';
import {
    RegisterDTO,
    LoginDTO,
    AuthTokens,
    Payload
} from '../types/auth.types';

import { ConflictError } from '../../../errors/Conflict';
import { BadRequestError } from '../../../errors/BadRequest';
import { UnauthorizedError } from '../../../errors/Unauthorized';

export class AuthService {
    private authRepository = new AuthRepository();

    private static readonly SALT_ROUNDS = 12;

    async register(data: RegisterDTO): Promise<void> {
        const { username, email, password } = data;

        const existingUsername =
            await this.authRepository.findUserByUsername(username);

        if (existingUsername)
            throw new ConflictError("Username already exists");

        const existingEmail =
            await this.authRepository.findUserByEmail(email);

        if (existingEmail)
            throw new ConflictError("Email already exists");

        const hashedPassword = await bcrypt.hash(
            password,
            AuthService.SALT_ROUNDS
        );

        await this.authRepository.createUser(
            username,
            hashedPassword,
            email
        );
    }

    async login(data: LoginDTO): Promise<AuthTokens> {
        const { identifier, password } = data;

        const user =
            await this.authRepository.findUserByIdentifier(identifier);

        if (!user)
            throw new UnauthorizedError("Invalid credentials");

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch)
            throw new UnauthorizedError("Invalid credentials");

        const payload = this.createPayload(user);

        const { accessToken, refreshToken } =
            this.generateToken(payload);

        const hashedRefreshToken = await bcrypt.hash(
            refreshToken,
            AuthService.SALT_ROUNDS
        );

        await this.authRepository.updateRefreshToken(
            user.id,
            hashedRefreshToken
        );

        return {
            accessToken,
            refreshToken
        };
    }

    async refresh(refreshToken: string): Promise<AuthTokens> {
        if (!refreshToken)
            throw new BadRequestError("Refresh token is required");

        let payload: Payload;

        try {
            payload = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET as string
            ) as Payload;
        } catch {
            throw new UnauthorizedError("Invalid refresh token");
        }

        const user =
            await this.authRepository.findUserById(payload.userId);

        if (!user || !user.refreshToken)
            throw new UnauthorizedError("Invalid refresh token");

        const matches = await bcrypt.compare(
            refreshToken,
            user.refreshToken
        );

        if (!matches)
            throw new UnauthorizedError("Invalid refresh token");

        const newPayload = this.createPayload(user);

        const {
            accessToken,
            refreshToken: newRefreshToken
        } = this.generateToken(newPayload);

        const hashedRefreshToken = await bcrypt.hash(
            newRefreshToken,
            AuthService.SALT_ROUNDS
        );

        await this.authRepository.updateRefreshToken(
            user.id,
            hashedRefreshToken
        );

        return {
            accessToken,
            refreshToken: newRefreshToken
        };
    }

    async logout(userId: string): Promise<void> {
        const user = await this.authRepository.findUserById(userId);

        if (!user)
            throw new UnauthorizedError("User not found");

        await this.authRepository.clearRefreshToken(Number(userId));
    }

    private createPayload(user: User): Payload {
        return {
            userId: user.id.toString(),
            username: user.username
        };
    }

    private generateToken(payload: Payload): AuthTokens {
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET as string,
            {
                expiresIn:
                    (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) ||
                    "15m"
            }
        );

        const refreshToken = jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET as string,
            {
                expiresIn:
                    (process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"]) ||
                    "7d"
            }
        );

        return {
            accessToken,
            refreshToken
        };
    }
}