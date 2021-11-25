import { Context } from "koa"
import { Error } from "mongoose"

export default function () {
    return async function (ctx: Context, next: Function) {
        try {
            await next()
        } catch (err) {
            if (err instanceof Error.ValidationError) {
                ctx.throw(422, err)
            } else if (err instanceof Error || err.name === "MongoServerError") {
                ctx.throw(400, err)
            } else {
                ctx.throw(500, err)
            }
        }
    }
}
