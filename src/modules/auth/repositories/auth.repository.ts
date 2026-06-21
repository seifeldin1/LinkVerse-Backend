import { User } from "../../../models/user.model";

export class AuthRepository {
    async findUserById(id:string): Promise<User | null> {
        return User.findOne({where : {id}})
    }
    async findUserByEmail(email:string): Promise<User | null> {
        return User.findOne({ where: { email } })
    }

    async findUserByUsername(username:string): Promise<User | null> {
        return User.findOne({ where: { username } })
    }

    async createUser(username:string , password:string , email:string): Promise<void> {
        User.create({ username , email , password })
    }

    async updateRefreshToken(userId:number , refreshToken:string): Promise<void> {
        await User.update({ refreshToken }, { where: { id: userId } })
    }
}