import { Context } from "koa"

export default function () {
    return async function (ctx: Context, next: Function) {
        try {
            await next()
        } catch (err) {
            if (err.name === "ValidationError") {
                ctx.throw(422, err)
            } else {
                ctx.throw(500, err)
            }
        }
    }
}
