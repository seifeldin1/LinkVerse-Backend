import {z} from 'zod';

export const registerSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters long')
        .max(20, 'Username must be at most 20 characters long')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
    
    email: z.string()
        .email('Invalid email address'),
    
    password: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .max(64, 'Password must be at most 64 characters long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)'),
});


export const loginSchema = z.object({
    identifier:z.string()
        .min(3, 'Identifier must be at least 3 characters long'),
    
    password: z.string()
        .min(8, 'Password must be at least 8 characters long')
        .max(64, 'Password must be at most 64 characters long')
        .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
        .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
        .regex(/[0-9]/, 'Password must contain at least one number')
        .regex(/[@$!%*?&]/, 'Password must contain at least one special character (@$!%*?&)'),
});

export const refreshTokenSchema = z.object({
    refreshToken: z.string()
        .min(1, 'Refresh token is required')
});