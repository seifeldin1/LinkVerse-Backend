import bcrypt from 'bcrypt';
import jwt, { JwtPayload, SignOptions } from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository';
import { RegisterDTO , LoginDTO , AuthTokens , Payload } from '../types/auth.types';
import { response } from 'express';

export class AuthService {
    private authRepository = new AuthRepository();
    // we need here to do the 3 main functions: register , login , logout

    async register(data:RegisterDTO) : Promise <void>{
        const username = data.username
        const email = data.email
        const password = data.password
        const existingUsername = await this.authRepository.findUserByUsername(username)
        if(existingUsername)
            throw new Error("Username already exists")

        if(email){
            const existingEmail = await this.authRepository.findUserByEmail(email)
            if(existingEmail)
                throw new Error("Email already exists")
        }

        const hashedPassword = await bcrypt.hash(password, 20)
        await this.authRepository.createUser(username , hashedPassword , email);
    }

    async login(data:LoginDTO) : Promise<AuthTokens>{
        const identifier = data.identifier
        const password = data.password
        const user = await this.authRepository.findUserByUsername(identifier) || await this.authRepository.findUserByEmail(identifier)
        if(!user)
            throw new Error("Invalid Email or Username")

        const passwordMatch = await bcrypt.compare(password , user.password)
        if(!passwordMatch)
            throw new Error("Incorrect Password")
        const payload:Payload ={
            userId: user.id.toString(),
            username: user.username,
            iat: Math.floor(Date.now()/1000)
        }

        const {accessToken , refreshToken} = this.generateToken(payload)
        this.authRepository.updateRefreshToken(user.id , refreshToken)
        return {accessToken , refreshToken}
    }

    async refresh(refreshToken:string) : Promise<AuthTokens>{
        if(!refreshToken)
            throw new Error("Refresh token is required")

        let payload:Payload
        try{
            payload = jwt.verify(refreshToken , process.env.JWT_REFRESH_SECRET as string) as Payload
        } catch(err){
            throw new Error("Invalid refresh token")
        }
        const user = await this.authRepository.findUserByUsername(payload.username)
        if(!user || refreshToken !== user.refreshToken)
            throw new Error("Invalid refresh token")
        const newPayload : Payload = {
            userId : user.id.toString(),
            username: user.username,
            iat: Math.floor(Date.now()/1000)
        }
        const {accessToken , refreshToken : newRefreshToken } = this.generateToken(newPayload)
        await this.authRepository.updateRefreshToken(user.id , newRefreshToken)
        return {accessToken , refreshToken : newRefreshToken }
    }

    private generateToken(payload:Payload) : AuthTokens{
        const accessToken = jwt.sign(payload , process.env.JWT_SECRET as string , {
            expiresIn: process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"] || '1d'
        })

        const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string , {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as SignOptions["expiresIn"] || '7d'
        })

        return {accessToken , refreshToken}
    }

}