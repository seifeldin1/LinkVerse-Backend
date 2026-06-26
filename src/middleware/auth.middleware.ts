import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/Unauthorized";
import { Payload } from "../modules/auth/types/auth.types";

export interface AuthRequest extends Request {
    user: Payload;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new UnauthorizedError("Access token required"));
    }

    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
        ) as Payload;

        req.user = decoded;

        next();
    } catch {
        next(new UnauthorizedError("Invalid or expired access token"));
    }
};