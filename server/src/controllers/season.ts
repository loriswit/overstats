import { Context } from "koa"
import { Season } from "../models/event"

export default class SeasonController {

    public static async list(ctx: Context) {
        ctx.body = Object.values(Season)
    }
}
