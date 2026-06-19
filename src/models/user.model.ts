import { DataTypes , Model } from "sequelize";
import { sequelize } from "../config/database";

export class User extends Model {
    public id!: number;
    public username!: string;
    public email!: string;
    public password!: string;
    public refreshToken!: string | null;
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

User.init({
        id:{
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true,
            unique: true,
        },
        username: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        refreshToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
    }, {
        sequelize,
        tableName: "users",
        timestamps: true,
    }
)