import { Context } from "koa"
import auth from "basic-auth"

export default function () {
    return async function (ctx: Context, next: Function) {
        ctx.credentials = auth(ctx.req)
        if (!ctx.credentials) {
            ctx.throw(401, "Basic authentication is missing")
        }

        await next()
    }
}
