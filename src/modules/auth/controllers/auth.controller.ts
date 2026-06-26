import { Request, Response, NextFunction } from "express";

import { AuthService } from "../services/auth.service";

import {
    registerSchema,
    loginSchema,
    refreshTokenSchema
} from "../validation/auth.validation";

import {
    RegisterDTO,
    LoginDTO,
    RefreshTokenDTO,
    Payload
} from "../types/auth.types";

export interface AuthRequest extends Request {
    user: Payload;
}

export class AuthController {
    private authService = new AuthService();

    register = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data: RegisterDTO = registerSchema.parse(req.body);

            await this.authService.register(data);

            res.status(201).json({
                success: true,
                message: "User registered successfully"
            });

        } catch (err) {
            next(err);
        }
    };

    login = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const data: LoginDTO = loginSchema.parse(req.body);

            const tokens = await this.authService.login(data);

            res.status(200).json({
                success: true,
                message: "Login successful",
                data: tokens
            });

        } catch (err) {
            next(err);
        }
    };

    refresh = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const { refreshToken }: RefreshTokenDTO =
                refreshTokenSchema.parse(req.body);

            const tokens =
                await this.authService.refresh(refreshToken);

            res.status(200).json({
                success: true,
                message: "Token refreshed successfully",
                data: tokens
            });

        } catch (err) {
            next(err);
        }
    };

    logout = async (
        req: AuthRequest,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            await this.authService.logout(req.user.userId);

            res.status(200).json({
                success: true,
                message: "Logout successful"
            });

        } catch (err) {
            next(err);
        }
    };
}