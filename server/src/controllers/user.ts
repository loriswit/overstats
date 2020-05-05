import { Context } from "koa"
import User from "../models/user"
import bcrypt from "bcrypt"
import fetch from "node-fetch"
import { SeasonName, SeasonSchema } from "../models/season"

export default class UserController {

    public static async getUser(name: string, ctx: Context, next: Function) {
        ctx.user = await User
            .findOne({ name: { $regex: new RegExp(name, "i") } })
            .exec()

        if (!ctx.user) {
            ctx.throw(404, "User doesn't exist: " + name)
        }

        return next()
    }

    public static async read(ctx: Context) {
        const gamesCount = ctx.user.seasons
            .map((s: SeasonSchema) => s.games.length + s.placements.length)
            .reduce((a: number, b: number) => a + b, 0)

        const seasons = Object.entries(SeasonName)
            .map(function ([key, name]) {
                const season = ctx.user.seasons.find((s: SeasonSchema) => s.name === name)
                const games = season ? season.games.length + season.placements.length : 0

                return {
                    key,
                    name,
                    games
                }
            })

        ctx.body = {
            name: ctx.user.name,
            tag: ctx.user.battleTag,
            games: gamesCount,
            seasons
        }

        ctx.status = 200
    }

    public static async readIcon(ctx: Context) {
        if (ctx.user.battleTag) {
            const tag = ctx.user.battleTag.replace("#", "-")
            const response = await fetch(`https://ow-api.com/v1/stats/pc/us/${tag}/profile`)
            const profile = await response.json()

            ctx.body = { icon: profile.icon }
            ctx.status = 200
        } else {
            ctx.status = 204
        }
    }

    public static async create(ctx: Context) {
        const payload = ctx.request.body
        if (!payload.pass || payload.pass.length < 6) {
            ctx.throw(422, "Password must have at least 6 characters")
        }
        if (payload.pass) {
            payload.pass = await bcrypt.hash(payload.pass, 10)
        }
        const user = new User(payload)

        try {
            await user.save()
            ctx.status = 201
        } catch (err) {
            if (err.name === "MongoError" && err.code === 11000) {
                ctx.throw(409, "User name is already taken: " + user.name)
            } else {
                throw err
            }
        }
    }
}
