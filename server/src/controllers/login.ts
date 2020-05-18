import { Context } from "koa"
import UserModel from "../models/user"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

export default class LoginController {

    public static async login(ctx: Context) {
        // case-insensitive search
        const user = await UserModel.findOne({ name: ctx.credentials.name })
            .collation({ locale: "en", strength: 2 }).exec()

        if (!user || !await bcrypt.compare(ctx.credentials.pass, user.pass)) {
            ctx.throw(401, "Wrong username and/or password")
        }

        const expireAfter = Number(process.env.JWT_EXPIRE_AFTER ?? 3600)
        ctx.body = {
            username: user.name,
            token: jwt.sign({
                id: user._id,
                exp: Math.floor(Date.now() / 1000) + expireAfter,
            }, process.env.JWT_SECRET ?? "secret")
        }
    }
}
