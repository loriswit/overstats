import UserModel from "../src/models/user"
import jwt from "jsonwebtoken"

export async function makeToken(id: string): Promise<string> {
    const expireAfter = Number(process.env.JWT_EXPIRE_AFTER ?? 3600)
    return jwt.sign({
        id: id,
        exp: Math.floor(Date.now() / 1000) + expireAfter,
    }, process.env.JWT_SECRET ?? "secret")
}

export async function makeTokenFor(username: string): Promise<string> {
    const user = await UserModel.findOne({ name: username }).exec()
    if (!user) {
        throw new Error("User not found: " + username)
    }
    return makeToken(user._id)
}
