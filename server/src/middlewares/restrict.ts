import { Context } from "koa"

export default function () {
    return async function (ctx: Context, next: Function) {
        if (!ctx.user) {
            ctx.throw(500, "Restricted access must be in a user context")
        }

        if (!ctx.state.user) {
            ctx.throw(500, "JWT auth missing")
        }

        // restrict access to specific user
        if (ctx.state.user.id != ctx.user.id) {
            ctx.throw(403)
        }

        await next()
    }
}
