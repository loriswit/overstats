import { Context } from "koa"
import UserModel from "../models/user"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const expireAfter = Number(process.env.JWT_EXPIRE_AFTER ?? 3600)
const secret = process.env.JWT_SECRET ?? "secret"

export default class LoginController {

    public static async login(ctx: Context) {
        // case-insensitive search
        const user = await UserModel.findOne({ name: ctx.credentials.name })
            .collation({ locale: "en", strength: 2 }).exec()

        if (!user || !await bcrypt.compare(ctx.credentials.pass, user.pass)) {
            ctx.throw(401, "Wrong username and/or password")
        }

        const expiresOn = Math.floor(Date.now() / 1000) + expireAfter
        const token = jwt.sign({ id: user._id, exp: expiresOn }, secret)

        ctx.body = { username: user.name, token, expires: new Date(expiresOn * 1000) }
    }

    public static async newToken(ctx: Context) {
        const id = ctx.state.user.id
        const expiresOn = Math.floor(Date.now() / 1000) + expireAfter
        const token = jwt.sign({ id, exp: expiresOn }, secret)

        ctx.body = { token, expires: new Date(expiresOn * 1000) }
    }
}
