import { Context } from "koa"
import UserModel, { User } from "../models/user"
import bcrypt from "bcrypt"
import GameModel from "../models/game"
import PlacementModel from "../models/placement"
import { isDbError } from "../utils/is-db-error"

export default class UserController {

    public static async getUser(name: string, ctx: Context, next: Function) {
        ctx.user = await UserModel.findOne({ name })
            .collation({ locale: "en", strength: 2 }).exec()

        if (!ctx.user) {
            ctx.throw(404, "User doesn't exist: " + name)
        }

        return next()
    }

    public static async create(ctx: Context) {
        const payload = ctx.request.body
        if (!payload.pass || payload.pass.length < 6) {
            ctx.throw(422, "Password must have at least 6 characters")
        }
        payload.pass = await bcrypt.hash(payload.pass, 10)
        const user = new UserModel(payload)

        try {
            await user.save()
            ctx.body = user.export()
            ctx.status = 201
        } catch (err) {
            if (isDbError(err) && err.code === 11000) {
                ctx.throw(409, "User name is already taken: " + user.name)
            } else {
                throw err
            }
        }
    }

    public static async read(ctx: Context) {
        interface PlayedSeason {
            name: string,
            games: number,
            sr?: number
        }

        const userWithSeasons = ctx.user.export() as User & { seasons: PlayedSeason[] }

        const seasons = await GameModel.aggregate([
            {
                $group: {
                    _id: "$season",
                    games: { $sum: 1 },
                    sr: { $max: "$sr" },
                    date: { $max: "$date" }
                }
            },
            {
                $sort: { "date": 1 }
            }
        ])

        userWithSeasons.seasons = seasons.map(({ _id, games, sr }) => ({
            name: _id,
            games,
            sr: sr ? sr : undefined
        }))

        ctx.body = userWithSeasons
    }

    public static async delete(ctx: Context) {
        await Promise.all([
            GameModel.deleteMany({ user: ctx.user }).exec(),
            PlacementModel.deleteMany({ user: ctx.user }).exec(),
            ctx.user.remove()])

        ctx.body = ctx.user.export()
    }
}
