import jwt from "koa-jwt"

export default function () {
    return jwt({ secret: process.env.JWT_SECRET ?? "secret" })
}
