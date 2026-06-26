import bcrypt from 'bcrypt';
import jwt, {  SignOptions } from 'jsonwebtoken';
import { AuthRepository } from '../repositories/auth.repository';
import { RegisterDTO , LoginDTO , AuthTokens , Payload } from '../types/auth.types';


export class AuthService {
    private authRepository = new AuthRepository();

    async register(data:RegisterDTO) : Promise <void>{
        const username = data.username
        const email = data.email
        const password = data.password
        const existingUsername = await this.authRepository.findUserByUsername(username)
        if(existingUsername)
            throw new Error("Username already exists")

        const existingEmail = await this.authRepository.findUserByEmail(email)
        if(existingEmail)
            throw new Error("Email already exists")
        
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
        const hashedRefreshToken = await bcrypt.hash(refreshToken , 20)
        await this.authRepository.updateRefreshToken(user.id , hashedRefreshToken)
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
        const user = await this.authRepository.findUserById(payload.userId)
        if(!user || !user.refreshToken)
            throw new Error("Invalid refresh token")
        const matches = await bcrypt.compare(refreshToken , user.refreshToken)
        if(!matches)
            throw new Error("Invalid refresh token")
        const newPayload : Payload = {
            userId : user.id.toString(),
            username: user.username,
            iat: Math.floor(Date.now()/1000)
        }
        const {accessToken , refreshToken : newRefreshToken } = this.generateToken(newPayload)
        const hashedRefreshToken = await bcrypt.hash(newRefreshToken , 20)
        await this.authRepository.updateRefreshToken(user.id , hashedRefreshToken)
        return {accessToken , refreshToken : newRefreshToken }
    }

    async logout(userId:string): Promise<void>{
        await this.authRepository.clearRefreshToken(parseInt(userId))
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