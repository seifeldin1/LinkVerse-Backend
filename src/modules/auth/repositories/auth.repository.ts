import { User } from "../../../models/user.model";
import {Op} from "sequelize"
export class AuthRepository {
    async findUserById(id:string): Promise<User | null> {
        return await User.findOne({where : {id}})
    }
    async findUserByEmail(email:string): Promise<User | null> {
        return await User.findOne({ where: { email } })
    }

    async findUserByUsername(username:string): Promise<User | null> {
        return await User.findOne({ where: { username } })
    }

    async findUserByIdentifier(identifier:string): Promise<User | null>{
        return await User.findOne({
            where:{
                [Op.or]:[{email: identifier}, {username: identifier}]
            }
        })
    }
    async createUser(username:string , password:string , email:string): Promise<void> {
        await User.create({ username , email , password })
    }

    async updateRefreshToken(userId:number , refreshToken:string): Promise<void> {
        await User.update({ refreshToken }, { where: { id: userId } })
    }

    async clearRefreshToken(userId:number):Promise<void>{
        await User.update({refreshToken: null} , {where : {id:userId}})
    }

    

}